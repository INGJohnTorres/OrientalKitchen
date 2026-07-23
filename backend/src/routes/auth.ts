import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/async-handler";

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

export default router;
