import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAuth } from "../middleware/auth";
import { enviarCorreoPedido } from "../lib/correo";

const router = Router();

const itemSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
});

const pedidoSchema = z.object({
  mesa: z.string().min(1),
  nombreCliente: z.string().min(1),
  telefono: z.string().optional(),
  observaciones: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

// POST /api/pedidos — el cliente envía su pedido (opción 2 y 3 del flujo: guardar en BD + correo)
router.post("/", async (req, res) => {
  const parsed = pedidoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { mesa, nombreCliente, telefono, observaciones, items } = parsed.data;

  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((i) => i.productoId) } },
  });

  const total = items.reduce((acc, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return acc + (producto ? producto.precio * item.cantidad : 0);
  }, 0);

  const pedido = await prisma.pedido.create({
    data: {
      mesa,
      nombreCliente,
      telefono,
      observaciones,
      total,
      items: {
        create: items.map((item) => {
          const producto = productos.find((p) => p.id === item.productoId)!;
          return {
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnidad: producto.precio,
          };
        }),
      },
    },
    include: { items: { include: { producto: true } } },
  });

  // Envío de correo con el resumen del pedido (opción 3). No bloquea la respuesta si falla.
  const resumen = pedido.items
    .map((i) => `${i.cantidad} x ${i.producto.nombre}`)
    .join("\n");
  enviarCorreoPedido(
    `Mesa: ${mesa}\nCliente: ${nombreCliente}\n\n${resumen}\n\nTotal: $${total}`
  ).catch((err) => console.error("Error enviando correo:", err));

  // TODO: notificarNuevoPedido(pedido) — ver src/lib/socket.ts para tiempo real.

  res.status(201).json(pedido);
});

// GET /api/pedidos — admin, panel de pedidos
router.get("/", requiereAuth, async (req, res) => {
  const { estado } = req.query;
  const pedidos = await prisma.pedido.findMany({
    where: estado ? { estado: String(estado) as any } : undefined,
    include: { items: { include: { producto: true } } },
    orderBy: { creadoEn: "desc" },
  });
  res.json(pedidos);
});

const estadoSchema = z.object({
  estado: z.enum(["nuevo", "aceptado", "preparando", "listo", "entregado", "cancelado"]),
});

// PATCH /api/pedidos/:id/estado — admin, cambia el estado del pedido
router.patch("/:id/estado", requiereAuth, async (req, res) => {
  const parsed = estadoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const pedido = await prisma.pedido.update({
    where: { id: req.params.id },
    data: { estado: parsed.data.estado },
  });
  res.json(pedido);
});

export default router;
