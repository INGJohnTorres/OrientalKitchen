"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const async_handler_1 = require("../lib/async-handler");
const router = (0, express_1.Router)();
const varianteSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    nombre: zod_1.z.string().min(1),
    precio: zod_1.z.number().int().nonnegative(),
    descripcion: zod_1.z.string().optional(),
});
const productoSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    nombre: zod_1.z.string().min(1),
    descripcion: zod_1.z.string().default(""),
    precio: zod_1.z.number().int().nonnegative(),
    imagen: zod_1.z.string().optional(),
    categoriaId: zod_1.z.string().min(1),
    etiquetas: zod_1.z.array(zod_1.z.enum(["Nuevo", "Picante", "Vegetariano", "Promoción"])).optional(),
    variantes: zod_1.z.array(varianteSchema).optional(),
    destacado: zod_1.z.boolean().optional(),
    masVendido: zod_1.z.boolean().optional(),
    activo: zod_1.z.boolean().optional(),
});
// GET /api/productos?categoria=arroz-2 — público, solo activos (para el menú del cliente)
router.get("/", (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { categoria } = req.query;
    const productos = await prisma_1.prisma.producto.findMany({
        where: {
            activo: true,
            ...(categoria ? { categoriaId: String(categoria) } : {}),
        },
        orderBy: { creadoEn: "asc" },
    });
    res.json(productos);
}));
// GET /api/productos/todos — admin, incluye inactivos (para el editor de productos)
router.get("/todos", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const productos = await prisma_1.prisma.producto.findMany({ orderBy: { creadoEn: "asc" } });
    res.json(productos);
}));
// POST /api/productos — admin (crear producto nuevo; usa el id enviado si viene, si no genera uno)
router.post("/", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = productoSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { id, ...resto } = parsed.data;
    const producto = await prisma_1.prisma.producto.create({ data: id ? { id, ...resto } : resto });
    res.status(201).json(producto);
}));
// PUT /api/productos/:id — admin (editar nombre/precio/foto/variantes/activo/etc.)
router.put("/:id", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = productoSchema.partial().safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { id, ...resto } = parsed.data;
    try {
        const producto = await prisma_1.prisma.producto.update({
            where: { id: req.params.id },
            data: resto,
        });
        res.json(producto);
    }
    catch (err) {
        // P2025 = "registro no encontrado" en Prisma. El frontend usa este 404
        // como señal de "todavía no existe" y reintenta con POST para crearlo.
        if (err?.code === "P2025")
            return res.status(404).json({ error: "Producto no encontrado." });
        throw err;
    }
}));
// DELETE /api/productos/:id — admin
router.delete("/:id", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    await prisma_1.prisma.producto.delete({ where: { id: req.params.id } });
    res.status(204).send();
}));
exports.default = router;
