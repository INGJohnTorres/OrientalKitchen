"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiereAuth = requiereAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requiereAuth(req, res, next) {
    const encabezado = req.headers.authorization;
    const token = encabezado?.startsWith("Bearer ") ? encabezado.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado." });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
}
