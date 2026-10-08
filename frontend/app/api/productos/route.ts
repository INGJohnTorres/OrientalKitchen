import { prisma } from "@/lib/server/prisma";
import { requiereAuth, requierePlanPremium } from "@/lib/server/auth";
import { HttpError, json, leerJson, manejar } from "@/lib/server/http";
import { productoSchema } from "@/lib/server/producto-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/productos?categoria=arroz-2 — público, solo activos (para el menú del cliente)
export const GET = manejar(async (req: Request) => {
  const categoria = new URL(req.url).searchParams.get("categoria");
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      ...(categoria ? { categoriaId: categoria } : {}),
    },
    orderBy: { creadoEn: "asc" },
  });
  return json(productos);
});

// POST /api/productos — admin (crear producto nuevo; usa el id enviado si viene, si no genera uno)
export const POST = manejar(async (req: Request) => {
  requiereAuth(req);
  await requierePlanPremium();

  const parsed = productoSchema.safeParse(await leerJson(req));
  if (!parsed.success) throw new HttpError(400, { error: parsed.error.flatten() });

  const { id, ...resto } = parsed.data;
  const producto = await prisma.producto.create({ data: id ? { id, ...resto } : resto } as any);
  return json(producto, 201);
});
