import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/async-handler";

const router = Router();

const categoriaSchema = z.object({
  nombre: z.string().min(1),
  orden: z.number().optional(),
  estiloLista: z.boolean().optional(),
});

// GET /api/categorias — público
router.get("/", asyncHandler(async (_req, res) => {
  const categorias = await prisma.categoria.findMany({ orderBy: { orden: "asc" } });
  res.json(categorias);
}));

// POST /api/categorias — admin
router.post("/", requiereAuth, asyncHandler(async (req, res) => {
  const parsed = categoriaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const categoria = await prisma.categoria.create({ data: parsed.data });
  res.status(201).json(categoria);
}));

// PUT /api/categorias/:id — admin
router.put("/:id", requiereAuth, asyncHandler(async (req, res) => {
  const parsed = categoriaSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const categoria = await prisma.categoria.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(categoria);
}));

// DELETE /api/categorias/:id — admin
router.delete("/:id", requiereAuth, asyncHandler(async (req, res) => {
  await prisma.categoria.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;
