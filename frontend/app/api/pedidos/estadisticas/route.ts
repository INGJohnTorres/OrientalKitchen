import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requiereAuth } from "@/lib/server/auth";
import { HttpError, json, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DIAS_RANGO = 31;

const estadisticasQuerySchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha 'desde' inválida."),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha 'hasta' inválida."),
});

// GET /api/pedidos/estadisticas — admin, ventas y pedidos por tipo/producto
// en un rango de fechas (máximo un mes) para el dashboard. Exclusivo del
// plan premium.
export const GET = manejar(async (req: Request) => {
  requiereAuth(req);

  const config = await prisma.configuracion.findFirst();
  if (config?.plan !== "premium") {
    throw new HttpError(403, "El dashboard de estadísticas es exclusivo del plan premium.");
  }

  const params = new URL(req.url).searchParams;
  const parsed = estadisticasQuerySchema.safeParse({
    desde: params.get("desde") ?? undefined,
    hasta: params.get("hasta") ?? undefined,
  });
  if (!parsed.success) throw new HttpError(400, { error: parsed.error.flatten() });
  const { desde, hasta } = parsed.data;

  // Los días se cuentan en hora de Colombia (UTC-5, sin horario de verano).
  // Sin el desfase, el servidor (UTC) corría el día 5 horas: los pedidos de
  // la noche (después de las 7 p. m.) caían en el día siguiente.
  const inicio = new Date(`${desde}T00:00:00-05:00`);
  const fin = new Date(`${hasta}T23:59:59.999-05:00`);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || inicio > fin) {
    throw new HttpError(400, "Rango de fechas inválido.");
  }
  const dias = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
  if (dias > MAX_DIAS_RANGO) {
    throw new HttpError(400, `El rango no puede superar ${MAX_DIAS_RANGO} días.`);
  }

  const pedidos = await prisma.pedido.findMany({
    where: { creadoEn: { gte: inicio, lte: fin }, estado: { not: "cancelado" } },
    include: { items: true },
    orderBy: { creadoEn: "desc" },
  });

  type Referencia = { id: string; numero: number; cliente: string; mesa: string | null; total: number; creadoEn: Date };
  const porTipo: Record<string, { tipoPedido: string; cantidad: number; total: number; pedidos: Referencia[] }> = {
    mesa: { tipoPedido: "mesa", cantidad: 0, total: 0, pedidos: [] },
    domicilio: { tipoPedido: "domicilio", cantidad: 0, total: 0, pedidos: [] },
    recoger: { tipoPedido: "recoger", cantidad: 0, total: 0, pedidos: [] },
  };
  const productos: Record<string, { nombre: string; cantidad: number; total: number }> = {};
  let totalVentas = 0;

  for (const p of pedidos) {
    const grupo = porTipo[p.tipoPedido];
    grupo.cantidad += 1;
    grupo.total += p.total;
    grupo.pedidos.push({ id: p.id, numero: p.numero, cliente: p.cliente, mesa: p.mesa, total: p.total, creadoEn: p.creadoEn });
    totalVentas += p.total;
    for (const item of p.items) {
      if (!productos[item.nombre]) productos[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
      productos[item.nombre].cantidad += item.cantidad;
      productos[item.nombre].total += item.cantidad * item.precioUnitario;
    }
  }

  return json({
    rango: { desde, hasta },
    totalVentas,
    totalPedidos: pedidos.length,
    porTipo: Object.values(porTipo),
    productos: Object.values(productos).sort((a, b) => b.cantidad - a.cantidad),
  });
});
