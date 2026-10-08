import { prisma } from "@/lib/server/prisma";
import { requiereAuth, requierePlanPremium } from "@/lib/server/auth";
import { HttpError, json, leerJson, manejar, sinContenido } from "@/lib/server/http";
import { productoSchema } from "@/lib/server/producto-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

// PUT /api/productos/:id — admin (editar nombre/precio/foto/variantes/activo/etc.)
export const PUT = manejar(async (req: Request, { params }: Ctx) => {
  requiereAuth(req);
  await requierePlanPremium();

  const parsed = productoSchema.partial().safeParse(await leerJson(req));
  if (!parsed.success) throw new HttpError(400, { error: parsed.error.flatten() });

  const { id: _id, ...resto } = parsed.data;
  try {
    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: resto as any,
    });
    return json(producto);
  } catch (err: any) {
    // P2025 = "registro no encontrado" en Prisma. El frontend usa este 404
    // como señal de "todavía no existe" y reintenta con POST para crearlo.
    if (err?.code === "P2025") throw new HttpError(404, "Producto no encontrado.");
    throw err;
  }
});

// DELETE /api/productos/:id — admin
export const DELETE = manejar(async (req: Request, { params }: Ctx) => {
  requiereAuth(req);
  await requierePlanPremium();

  await prisma.producto.delete({ where: { id: params.id } });
  return sinContenido();
});
