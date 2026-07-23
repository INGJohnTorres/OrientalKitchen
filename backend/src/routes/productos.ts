import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/async-handler";

const router = Router();

const varianteSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  precio: z.number().int().nonnegative(),
  descripcion: z.string().optional(),
});

const productoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  descripcion: z.string().default(""),
  precio: z.number().int().nonnegative(),
  imagen: z.string().optional(),
  categoriaId: z.string().min(1),
  etiquetas: z.array(z.enum(["Nuevo", "Picante", "Vegetariano", "Promoción"])).optional(),
  variantes: z.array(varianteSchema).optional(),
  destacado: z.boolean().optional(),
  masVendido: z.boolean().optional(),
  activo: z.boolean().optional(),
});

// GET /api/productos?categoria=arroz-2 — público, solo activos (para el menú del cliente)
router.get("/", asyncHandler(async (req, res) => {
  const { categoria } = req.query;
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      ...(categoria ? { categoriaId: String(categoria) } : {}),
    },
    orderBy: { creadoEn: "asc" },
  });
  res.json(productos);
}));

// GET /api/productos/todos — admin, incluye inactivos (para el editor de productos)
router.get("/todos", requiereAuth, asyncHandler(async (_req, res) => {
  const productos = await prisma.producto.findMany({ orderBy: { creadoEn: "asc" } });
  res.json(productos);
}));

// POST /api/productos — admin (crear producto nuevo; usa el id enviado si viene, si no genera uno)
router.post("/", requiereAuth, asyncHandler(async (req, res) => {
  const parsed = productoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { id, ...resto } = parsed.data;
  const producto = await prisma.producto.create({ data: id ? { id, ...resto } : resto } as any);
  res.status(201).json(producto);
}));

// PUT /api/productos/:id — admin (editar nombre/precio/foto/variantes/activo/etc.)
router.put("/:id", requiereAuth, asyncHandler(async (req, res) => {
  const parsed = productoSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { id, ...resto } = parsed.data;
  try {
    const producto = await prisma.producto.update({
      where: { id: req.params.id },
      data: resto as any,
    });
    res.json(producto);
  } catch (err: any) {
    // P2025 = "registro no encontrado" en Prisma. El frontend usa este 404
    // como señal de "todavía no existe" y reintenta con POST para crearlo.
    if (err?.code === "P2025") return res.status(404).json({ error: "Producto no encontrado." });
    throw err;
  }
}));

// DELETE /api/productos/:id — admin
router.delete("/:id", requiereAuth, asyncHandler(async (req, res) => {
  await prisma.producto.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;
