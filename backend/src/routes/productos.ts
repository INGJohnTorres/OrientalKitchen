import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAuth } from "../middleware/auth";

const router = Router();

const productoSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  precio: z.number().int().positive(),
  imagen: z.string().url(),
  categoriaId: z.string().min(1),
  etiquetas: z.array(z.enum(["Nuevo", "Picante", "Vegetariano", "Promoción"])).optional(),
  destacado: z.boolean().optional(),
  masVendido: z.boolean().optional(),
  activo: z.boolean().optional(),
});

// GET /api/productos?categoria=hamburguesas — público
router.get("/", async (req, res) => {
  const { categoria } = req.query;
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      ...(categoria ? { categoriaId: String(categoria) } : {}),
    },
    orderBy: { creadoEn: "desc" },
  });
  res.json(productos);
});

// POST /api/productos — admin
router.post("/", requiereAuth, async (req, res) => {
  const parsed = productoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const producto = await prisma.producto.create({ data: parsed.data });
  res.status(201).json(producto);
});

// PUT /api/productos/:id — admin (editar, cambiar precio, activar/desactivar)
router.put("/:id", requiereAuth, async (req, res) => {
  const parsed = productoSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const producto = await prisma.producto.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(producto);
});

// DELETE /api/productos/:id — admin
router.delete("/:id", requiereAuth, async (req, res) => {
  await prisma.producto.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
