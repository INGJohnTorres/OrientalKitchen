import { prisma } from "@/lib/server/prisma";
import { json, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/categorias — público
export const GET = manejar(async () => {
  const categorias = await prisma.categoria.findMany({ orderBy: { orden: "asc" } });
  return json(categorias);
});
