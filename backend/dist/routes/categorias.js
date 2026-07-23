"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const async_handler_1 = require("../lib/async-handler");
const router = (0, express_1.Router)();
const categoriaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1),
    orden: zod_1.z.number().optional(),
    estiloLista: zod_1.z.boolean().optional(),
});
// GET /api/categorias — público
router.get("/", (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const categorias = await prisma_1.prisma.categoria.findMany({ orderBy: { orden: "asc" } });
    res.json(categorias);
}));
// POST /api/categorias — admin
router.post("/", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = categoriaSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const categoria = await prisma_1.prisma.categoria.create({ data: parsed.data });
    res.status(201).json(categoria);
}));
// PUT /api/categorias/:id — admin
router.put("/:id", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = categoriaSchema.partial().safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const categoria = await prisma_1.prisma.categoria.update({
        where: { id: req.params.id },
        data: parsed.data,
    });
    res.json(categoria);
}));
// DELETE /api/categorias/:id — admin
router.delete("/:id", auth_1.requiereAuth, (0, async_handler_1.asyncHandler)(async (req, res) => {
    await prisma_1.prisma.categoria.delete({ where: { id: req.params.id } });
    res.status(204).send();
}));
exports.default = router;
