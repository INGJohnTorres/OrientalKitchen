import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { firmarToken } from "@/lib/server/auth";
import { HttpError, json, leerJson, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  usuario: z.string().min(1),
  clave: z.string().min(1),
});

export const POST = manejar(async (req: Request) => {
  const parsed = loginSchema.safeParse(await leerJson(req));
  if (!parsed.success) throw new HttpError(400, "Usuario y clave son requeridos.");

  const { usuario, clave } = parsed.data;
  const cuenta = await prisma.usuario.findUnique({ where: { usuario } });

  if (!cuenta || !(await bcrypt.compare(clave, cuenta.claveHash))) {
    throw new HttpError(401, "Usuario o contraseña incorrectos.");
  }

  const datos = { id: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol };
  return json({ token: firmarToken(datos), usuario: datos });
});
