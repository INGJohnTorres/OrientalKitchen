import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { HttpError } from "./http";

export interface UsuarioToken {
  id: string;
  usuario: string;
  rol: string;
}

/** Equivale a requiereAuth: exige un JWT valido en `Authorization: Bearer ...`. */
export function requiereAuth(req: Request): UsuarioToken {
  const encabezado = req.headers.get("authorization");
  const token = encabezado?.startsWith("Bearer ") ? encabezado.slice(7) : null;
  if (!token) throw new HttpError(401, "Token no proporcionado.");

  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as UsuarioToken;
  } catch {
    throw new HttpError(401, "Token inválido o expirado.");
  }
}

/** Solo la cuenta con rol "superadmin" puede pasar. */
export function requiereSuperAdmin(usuario: UsuarioToken) {
  if (usuario.rol !== "superadmin") {
    throw new HttpError(403, "Solo el superadministrador puede hacer esto.");
  }
}

/** El editor de productos es exclusivo del plan premium. */
export async function requierePlanPremium() {
  const config = await prisma.configuracion.findFirst();
  if (config?.plan !== "premium") {
    throw new HttpError(403, "Editar el menú es una función exclusiva del plan Premium.");
  }
}

export function firmarToken(usuario: UsuarioToken) {
  return jwt.sign(usuario, process.env.JWT_SECRET as string, { expiresIn: "12h" });
}
