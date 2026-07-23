"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarCorreoPedido = enviarCorreoPedido;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transportador = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function enviarCorreoPedido(texto) {
    if (!process.env.SMTP_USER || !process.env.RESTAURANT_EMAIL)
        return;
    await transportador.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.RESTAURANT_EMAIL,
        subject: "Nuevo pedido — Menú QR",
        text: texto,
    });
}
