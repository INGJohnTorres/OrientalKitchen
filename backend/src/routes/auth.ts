import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/async-handler";
import { requiereAuth, RequestConUsuario } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  usuario: z.string().min(1),
  clave: z.string().min(1),
});

router.post("/login", asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Usuario y clave son requeridos." });
  }

  const { usuario, clave } = parsed.data;
  const cuenta = await prisma.usuario.findUnique({ where: { usuario } });

  if (!cuenta || !(await bcrypt.compare(clave, cuenta.claveHash))) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  const token = jwt.sign(
    { id: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: "12h" }
  );

  res.json({ token, usuario: { id: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol } });
}));

const cambiarClaveSchema = z.object({
  claveActual: z.string().min(1),
  claveNueva: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
});

// PATCH /api/auth/clave — admin autenticado, cambia su propia contraseña
router.patch("/clave", requiereAuth, asyncHandler(async (req: RequestConUsuario, res) => {
  const parsed = cambiarClaveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Datos inválidos." });
  }

  const cuenta = await prisma.usuario.findUnique({ where: { id: req.usuario!.id } });
  if (!cuenta) return res.status(404).json({ error: "Usuario no encontrado." });

  const { claveActual, claveNueva } = parsed.data;
  if (!(await bcrypt.compare(claveActual, cuenta.claveHash))) {
    return res.status(401).json({ error: "La contraseña actual no es correcta." });
  }

  const claveHash = await bcrypt.hash(claveNueva, 10);
  await prisma.usuario.update({ where: { id: cuenta.id }, data: { claveHash } });

  res.json({ ok: true });
}));

export default router;
