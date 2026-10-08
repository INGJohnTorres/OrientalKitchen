import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requiereAuth } from "@/lib/server/auth";
import { HttpError, json, leerJson, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cambiarClaveSchema = z.object({
  claveActual: z.string().min(1),
  claveNueva: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
});

// PATCH /api/auth/clave — admin autenticado, cambia su propia contraseña
export const PATCH = manejar(async (req: Request) => {
  const sesion = requiereAuth(req);

  const parsed = cambiarClaveSchema.safeParse(await leerJson(req));
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message || "Datos inválidos.");
  }

  const cuenta = await prisma.usuario.findUnique({ where: { id: sesion.id } });
  if (!cuenta) throw new HttpError(404, "Usuario no encontrado.");

  const { claveActual, claveNueva } = parsed.data;
  if (!(await bcrypt.compare(claveActual, cuenta.claveHash))) {
    throw new HttpError(401, "La contraseña actual no es correcta.");
  }

  const claveHash = await bcrypt.hash(claveNueva, 10);
  await prisma.usuario.update({ where: { id: cuenta.id }, data: { claveHash } });

  return json({ ok: true });
});
