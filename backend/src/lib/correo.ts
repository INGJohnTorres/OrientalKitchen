import nodemailer from "nodemailer";

const transportador = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarCorreoPedido(texto: string) {
  if (!process.env.SMTP_USER || !process.env.RESTAURANT_EMAIL) return;

  await transportador.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.RESTAURANT_EMAIL,
    subject: "Nuevo pedido — Menú QR",
    text: texto,
  });
}
