import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requiereAuth, requiereSuperAdmin } from "@/lib/server/auth";
import { HttpError, json, leerJson, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function obtenerConfig() {
  // Fila única de configuración del negocio (sembrada por prisma/seed.ts).
  const config = await prisma.configuracion.findFirst();
  if (!config) throw new Error("No se encontró la configuración del negocio.");
  return config;
}

// GET /api/configuracion — público: el sitio del cliente necesita saber el
// plan actual para mostrar/ocultar pedidos y el dashboard.
export const GET = manejar(async () => json(await obtenerConfig()));

const planSchema = z.object({
  plan: z.enum(["basico", "medio", "premium"]),
});

// PATCH /api/configuracion — solo superadmin, cambia el plan contratado.
export const PATCH = manejar(async (req: Request) => {
  requiereSuperAdmin(requiereAuth(req));

  const parsed = planSchema.safeParse(await leerJson(req));
  if (!parsed.success) throw new HttpError(400, { error: parsed.error.flatten() });

  const actual = await obtenerConfig();
  const config = await prisma.configuracion.update({
    where: { id: actual.id },
    data: { plan: parsed.data.plan },
  });
  return json(config);
});
