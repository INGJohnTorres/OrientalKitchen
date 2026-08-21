import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface RequestConUsuario extends Request {
  usuario?: { id: string; usuario: string; rol: string };
}

export function requiereAuth(
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
) {
  const encabezado = req.headers.authorization;
  const token = encabezado?.startsWith("Bearer ") ? encabezado.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as RequestConUsuario["usuario"];
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

/** Debe ir después de requiereAuth. Solo la cuenta con rol "superadmin" puede pasar. */
export function requiereSuperAdmin(req: RequestConUsuario, res: Response, next: NextFunction) {
  if (req.usuario?.rol !== "superadmin") {
    return res.status(403).json({ error: "Solo el superadministrador puede hacer esto." });
  }
  next();
}
