import { prisma } from "@/lib/server/prisma";
import { requiereAuth, requierePlanPremium } from "@/lib/server/auth";
import { json, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/productos/todos — admin, incluye inactivos (para el editor de productos)
export const GET = manejar(async (req: Request) => {
  requiereAuth(req);
  await requierePlanPremium();

  const productos = await prisma.producto.findMany({ orderBy: { creadoEn: "asc" } });
  return json(productos);
});
