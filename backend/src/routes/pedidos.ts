import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAuth } from "../middleware/auth";
import { enviarCorreoPedido } from "../lib/correo";
import { asyncHandler } from "../lib/async-handler";

const router = Router();

// Coincide exactamente con ItemCarrito del frontend (lib/types.ts): el precio
// y el nombre (con variante incluida) ya vienen resueltos desde el cliente,
// así que se guardan tal cual — es una "foto" del pedido en ese momento.
const itemSchema = z.object({
  claveUnica: z.string().min(1),
  productoId: z.string().min(1),
  nombre: z.string().min(1),
  imagen: z.string().optional(),
  precioUnitario: z.number().int().nonnegative(),
  cantidad: z.number().int().positive(),
});

// Mismas reglas que se aplican en los formularios del frontend (CartDrawer y
// PedidoRapidoModal): se validan también aquí porque el POST es público y no
// hay que confiar en que el cliente respete los `pattern`/filtros del <input>.
const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const TELEFONO_REGEX = /^\d{7,10}$/;
const MESA_REGEX = /^\d{1,4}$/;

const pedidoSchema = z
  .object({
    tipoPedido: z.enum(["mesa", "domicilio", "recoger"]).default("mesa"),
    mesa: z.string().optional(),
    cliente: z.string().min(1).regex(NOMBRE_REGEX, "El nombre solo puede contener letras."),
    telefono: z.string().regex(TELEFONO_REGEX, "El teléfono solo puede contener números (7 a 10 dígitos)."),
    observaciones: z.string().optional(),
    items: z.array(itemSchema).min(1),
    total: z.number().int().nonnegative(),
  })
  .refine((d) => d.tipoPedido !== "mesa" || (!!d.mesa && MESA_REGEX.test(d.mesa)), {
    message: "El número de mesa es obligatorio y solo puede contener números.",
    path: ["mesa"],
  });

function etiquetaTipoPedido(tipoPedido: string, mesa: string | null) {
  if (tipoPedido === "domicilio") return "Domicilio";
  if (tipoPedido === "recoger") return "Recoger en el local";
  return `Mesa ${mesa}`;
}

// POST /api/pedidos — público, el cliente envía su pedido desde el menú
router.post("/", asyncHandler(async (req, res) => {
  // El plan "basico" es solo menú digital por QR, sin pedidos. Se valida
  // también aquí (no solo ocultando botones en el frontend) para que no se
  // puedan crear pedidos llamando la API directamente.
  const config = await prisma.configuracion.findFirst();
  if (config?.plan === "basico") {
    return res.status(403).json({ error: "El plan actual no incluye pedidos en línea." });
  }

  const parsed = pedidoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { tipoPedido, mesa, cliente, telefono, observaciones, items, total } = parsed.data;

  const pedido = await prisma.pedido.create({
    data: {
      tipoPedido,
      mesa: tipoPedido === "mesa" ? mesa : null,
      cliente,
      telefono,
      observaciones,
      total,
      items: {
        create: items.map((i) => ({
          claveUnica: i.claveUnica,
          productoId: i.productoId,
          nombre: i.nombre,
          imagen: i.imagen,
          precioUnitario: i.precioUnitario,
          cantidad: i.cantidad,
        })),
      },
    },
    include: { items: true },
  });

  const resumen = pedido.items.map((i) => `${i.cantidad} x ${i.nombre}`).join("\n");
  enviarCorreoPedido(
    `${etiquetaTipoPedido(tipoPedido, mesa ?? null)}\nCliente: ${cliente}\n\n${resumen}\n\nTotal: $${total}`
  ).catch((err) => console.error("Error enviando correo:", err));

  // TODO: si activas socket.io (ver src/lib/socket.ts), emite aquí el evento
  // "pedido:nuevo" para que el panel/cocina se actualice al instante en vez
  // de esperar el refresco por polling.

  res.status(201).json(pedido);
}));

// GET /api/pedidos — admin/cocina, lista de pedidos (más recientes primero)
router.get("/", requiereAuth, asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const pedidos = await prisma.pedido.findMany({
    where: estado ? { estado: String(estado) as any } : undefined,
    include: { items: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(pedidos);
}));

const MAX_DIAS_RANGO = 31;

const estadisticasQuerySchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha 'desde' inválida."),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha 'hasta' inválida."),
});

// GET /api/pedidos/estadisticas — admin, ventas y pedidos por tipo/producto
// en un rango de fechas (máximo un mes) para el dashboard. Exclusivo del
// plan premium.
router.get("/estadisticas", requiereAuth, asyncHandler(async (req, res) => {
  const config = await prisma.configuracion.findFirst();
  if (config?.plan !== "premium") {
    return res.status(403).json({ error: "El dashboard de estadísticas es exclusivo del plan premium." });
  }

  const parsed = estadisticasQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { desde, hasta } = parsed.data;

  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T23:59:59.999`);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || inicio > fin) {
    return res.status(400).json({ error: "Rango de fechas inválido." });
  }
  const dias = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
  if (dias > MAX_DIAS_RANGO) {
    return res.status(400).json({ error: `El rango no puede superar ${MAX_DIAS_RANGO} días.` });
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

  res.json({
    rango: { desde, hasta },
    totalVentas,
    totalPedidos: pedidos.length,
    porTipo: Object.values(porTipo),
    productos: Object.values(productos).sort((a, b) => b.cantidad - a.cantidad),
  });
}));

const estadoSchema = z.object({
  estado: z.enum(["nuevo", "aceptado", "preparando", "listo", "entregado", "cancelado"]),
});

// PATCH /api/pedidos/:id/estado — admin/cocina, cambia el estado del pedido
router.patch("/:id/estado", requiereAuth, asyncHandler(async (req, res) => {
  const parsed = estadoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const pedido = await prisma.pedido.update({
    where: { id: req.params.id },
    data: { estado: parsed.data.estado },
  });
  res.json(pedido);
}));

// DELETE /api/pedidos/:id — admin, borra un pedido mal digitado (ej. mesa
// equivocada, pedido de prueba). Cascada automática sobre DetallePedido.
router.delete("/:id", requiereAuth, asyncHandler(async (req, res) => {
  const { count } = await prisma.pedido.deleteMany({ where: { id: req.params.id } });
  if (count === 0) return res.status(404).json({ error: "Pedido no encontrado." });
  res.status(204).send();
}));

export default router;
