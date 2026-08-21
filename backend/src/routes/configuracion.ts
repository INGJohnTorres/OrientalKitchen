import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requiereAuth, requiereSuperAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/async-handler";

const router = Router();

async function obtenerConfig() {
  // Fila única de configuración del negocio (sembrada por prisma/seed.ts).
  const config = await prisma.configuracion.findFirst();
  if (!config) throw new Error("No se encontró la configuración del negocio.");
  return config;
}

// GET /api/configuracion — público: el sitio del cliente necesita saber el
// plan actual para mostrar/ocultar pedidos y el dashboard.
router.get("/", asyncHandler(async (_req, res) => {
  res.json(await obtenerConfig());
}));

const planSchema = z.object({
  plan: z.enum(["basico", "medio", "premium"]),
});

// PATCH /api/configuracion — solo superadmin, cambia el plan contratado.
router.patch("/", requiereAuth, requiereSuperAdmin, asyncHandler(async (req, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const actual = await obtenerConfig();
  const config = await prisma.configuracion.update({
    where: { id: actual.id },
    data: { plan: parsed.data.plan },
  });
  res.json(config);
}));

export default router;
