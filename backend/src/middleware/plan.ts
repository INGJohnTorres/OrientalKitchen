import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

/** Debe ir después de requiereAuth. El editor de productos es exclusivo del plan premium. */
export async function requierePlanPremium(_req: Request, res: Response, next: NextFunction) {
  const config = await prisma.configuracion.findFirst();
  if (config?.plan !== "premium") {
    return res.status(403).json({ error: "Editar el menú es una función exclusiva del plan Premium." });
  }
  next();
}
