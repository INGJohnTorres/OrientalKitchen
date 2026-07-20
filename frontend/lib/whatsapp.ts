import { DatosCliente, ItemCarrito } from "./types";

function formatoMoneda(valor: number) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

/**
 * Detecta un emoji de comida acorde al nombre del producto/variante.
 * El orden importa: las palabras más específicas van primero para que,
 * por ejemplo, "Arroz Chino + Camarón y Palmitos" tome 🍤 y no 🍚.
 */
const EMOJIS_POR_PALABRA_CLAVE: [RegExp, string][] = [
  [/camar[oó]n|frutos del mar|palmitos|calamar|pulpo|conchit/i, "🍤"],
  [/wonton|lumpia|rollito/i, "🥟"],
  [/aros? de cebolla/i, "🧅"],
  [/chow ?mein|fideos|pasta/i, "🍜"],
  [/chow ?suey|mazorcada|salteado/i, "🥘"],
  [/crema de pollo|crema de champi|sopa/i, "🍲"],
  [/hamburguesa/i, "🍔"],
  [/perro caliente|combo perro/i, "🌭"],
  [/salchipapa|papa francesa|papas? a la francesa/i, "🍟"],
  [/alitas?/i, "🍗"],
  [/pollo|pechuga/i, "🍗"],
  [/costilla|lomo|cerdo|chuleta|churrasco|carnes? ahumada/i, "🥩"],
  [/huevos? de codorniz/i, "🥚"],
  [/arroz/i, "🍚"],
  [/gaseosa|jugo|hit|postob[oó]n|colombiana/i, "🥤"],
  [/cerveza|poker|pola|cola y pola/i, "🍺"],
  [/agua/i, "💧"],
  [/palillos/i, "🥢"],
];

export function emojiParaProducto(nombre: string): string {
  for (const [patron, emoji] of EMOJIS_POR_PALABRA_CLAVE) {
    if (patron.test(nombre)) return emoji;
  }
  return "🍽️";
}

/** Construye el texto del pedido exactamente en el formato solicitado. */
export function construirMensajePedido(
  cliente: DatosCliente,
  items: ItemCarrito[],
  total: number
) {
  const hora = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lineasPedido = items
    .map((i) => `• ${emojiParaProducto(i.nombre)} ${i.cantidad} ${i.nombre}`)
    .join("\n");

  let mensaje = `🧾 Nuevo Pedido\n\n`;
  mensaje += `Mesa: ${cliente.mesa}\n`;
  mensaje += `Cliente: ${cliente.nombre}\n\n`;
  mensaje += `Pedido:\n${lineasPedido}\n\n`;

  if (cliente.observaciones?.trim()) {
    mensaje += `📝 Observaciones:\n${cliente.observaciones.trim()}\n\n`;
  }

  mensaje += `💰 Total:\n${formatoMoneda(total)}\n\n`;
  mensaje += `🕒 Hora:\n${hora}`;

  return mensaje;
}

/**
 * Abre WhatsApp (app o web) con el mensaje del pedido ya escrito.
 *
 * IMPORTANTE: esta función se debe llamar de forma SÍNCRONA, directamente
 * dentro del manejador de click (sin await antes). La mayoría de navegadores
 * (Safari, Chrome) bloquean window.open() como pop-up si ocurre después de
 * una espera asíncrona, porque dejan de considerarlo un gesto directo del
 * usuario. Por eso el pedido se guarda en la base de datos/localStorage
 * DESPUÉS de abrir WhatsApp, no antes.
 */
export function enviarPedidoPorWhatsApp(
  cliente: DatosCliente,
  items: ItemCarrito[],
  total: number
) {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const mensaje = construirMensajePedido(cliente, items, total);
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
