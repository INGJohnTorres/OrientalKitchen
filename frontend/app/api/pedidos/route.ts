import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requiereAuth } from "@/lib/server/auth";
import { enviarCorreoPedido } from "@/lib/server/correo";
import { HttpError, json, leerJson, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
export const POST = manejar(async (req: Request) => {
  // El plan "basico" es solo menú digital por QR, sin pedidos. Se valida
  // también aquí (no solo ocultando botones en el frontend) para que no se
  // puedan crear pedidos llamando la API directamente.
  const config = await prisma.configuracion.findFirst();
  if (config?.plan === "basico") {
    throw new HttpError(403, "El plan actual no incluye pedidos en línea.");
  }

  const parsed = pedidoSchema.safeParse(await leerJson(req));
  if (!parsed.success) throw new HttpError(400, { error: parsed.error.flatten() });
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

  // En serverless la funcion puede congelarse al responder, asi que el aviso
  // por correo se espera aqui (no hace nada si no hay SMTP configurado).
  const resumen = pedido.items.map((i) => `${i.cantidad} x ${i.nombre}`).join("\n");
  await enviarCorreoPedido(
    `${etiquetaTipoPedido(tipoPedido, mesa ?? null)}\nCliente: ${cliente}\n\n${resumen}\n\nTotal: $${total}`
  ).catch((err) => console.error("Error enviando correo:", err));

  return json(pedido, 201);
});

// GET /api/pedidos — admin/cocina, lista de pedidos (más recientes primero)
export const GET = manejar(async (req: Request) => {
  requiereAuth(req);

  const estado = new URL(req.url).searchParams.get("estado");
  const pedidos = await prisma.pedido.findMany({
    where: estado ? { estado: estado as any } : undefined,
    include: { items: true },
    orderBy: { creadoEn: "desc" },
  });
  return json(pedidos);
});

// DELETE /api/pedidos — admin, borra TODO el historial de pedidos (incluye
// el que usan las estadísticas de ventas). Irreversible; pensado para
// limpiar datos de prueba, no para uso rutinario.
export const DELETE = manejar(async (req: Request) => {
  requiereAuth(req);

  const { count } = await prisma.pedido.deleteMany({});
  return json({ borrados: count });
});
