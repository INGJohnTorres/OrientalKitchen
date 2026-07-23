"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const async_handler_1 = require("../lib/async-handler");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    usuario: zod_1.z.string().min(1),
    clave: zod_1.z.string().min(1),
});
router.post("/login", (0, async_handler_1.asyncHandler)(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Usuario y clave son requeridos." });
    }
    const { usuario, clave } = parsed.data;
    const cuenta = await prisma_1.prisma.usuario.findUnique({ where: { usuario } });
    if (!cuenta || !(await bcryptjs_1.default.compare(clave, cuenta.claveHash))) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
    const token = jsonwebtoken_1.default.sign({ id: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol }, process.env.JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, usuario: { id: cuenta.id, usuario: cuenta.usuario, rol: cuenta.rol } });
}));
exports.default = router;
