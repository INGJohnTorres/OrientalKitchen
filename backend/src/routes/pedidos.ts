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

const pedidoSchema = z.object({
  mesa: z.string().min(1),
  cliente: z.string().min(1),
  telefono: z.string().optional(),
  observaciones: z.string().optional(),
  items: z.array(itemSchema).min(1),
  total: z.number().int().nonnegative(),
});

// POST /api/pedidos — público, el cliente envía su pedido desde el menú
router.post("/", asyncHandler(async (req, res) => {
  const parsed = pedidoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { mesa, cliente, telefono, observaciones, items, total } = parsed.data;

  const pedido = await prisma.pedido.create({
    data: {
      mesa,
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
    `Mesa: ${mesa}\nCliente: ${cliente}\n\n${resumen}\n\nTotal: $${total}`
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

export default router;
