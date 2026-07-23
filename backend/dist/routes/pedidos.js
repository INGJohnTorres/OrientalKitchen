"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const correo_1 = require("../lib/correo");
const async_handler_1 = require("../lib/async-handler");
const router = (0, express_1.Router)();
// Coincide exactamente con ItemCarrito del frontend (lib/types.ts): el precio
// y el nombre (con variante incluida) ya vienen resueltos desde el cliente,
// así que se guardan tal cual — es una "foto" del pedido en ese momento.
const itemSchema = zod_1.z.object({
    claveUnica: zod_1.z.string().min(1),
    productoId: zod_1.z.string().min(1),
    nombre: zod_1.z.string().min(1),
    imagen: zod_1.z.string().optional(),
    precioUnitario: zod_1.z.number().int().nonnegative(),
    cantidad: zod_1.z.number().int().positive(),
});
const pedidoSchema = zod_1.z.object({
    mesa: zod_1.z.string().min(1),
    cliente: zod_1.z.string().min(1),
    telefono: zod_1.z.string().optional(),
    observaciones: zod_1.z.string().optional(),
    items: zod_1.z.array(itemSchema).min(1),
    total: zod_1.z.number().int().nonnegative(),
});
// POST /api/pedidos — público, el cliente envía su pedido desde el menú
router.post("/", (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = pedidoSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { mesa, cliente, telefono, observaciones, items, total } = parsed.data;
    const pedido = await prisma_1.prisma.pedido.create({
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
    (0, correo_1.enviarCorreoPedido)(`Mesa: ${mesa}\nCliente: ${cliente}\n\n${resumen}\n\nTotal: $${total}`).catch((err) => console.error("Error enviando correo:", err));
    // TODO: si activas socket.io (ver src/lib/socket.ts), emite aquí el evento
    // "pedido:nuevo" para que el panel/cocina se actualice al instante en vez
    // de esperar el refresco por polling.
    res.status(201).json(pedido);
}));
// GET /api/pedidos — admin/cocina, lista de pedidos (más recientes primero)
router.get("/", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { estado } = req.query;
    const pedidos = await prisma_1.prisma.pedido.findMany({
        where: estado ? { estado: String(estado) } : undefined,
        include: { items: true },
        orderBy: { creadoEn: "desc" },
    });
    res.json(pedidos);
}));
const estadoSchema = zod_1.z.object({
    estado: zod_1.z.enum(["nuevo", "aceptado", "preparando", "listo", "entregado", "cancelado"]),
});
// PATCH /api/pedidos/:id/estado — admin/cocina, cambia el estado del pedido
router.patch("/:id/estado", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = estadoSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const pedido = await prisma_1.prisma.pedido.update({
        where: { id: req.params.id },
        data: { estado: parsed.data.estado },
    });
    res.json(pedido);
}));
exports.default = router;
