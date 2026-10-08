import { z } from "zod";

const varianteSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  precio: z.number().int().nonnegative(),
  descripcion: z.string().optional(),
});

export const productoSchema = z.object({
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
