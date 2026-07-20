import { DatosCliente, ItemCarrito } from "./types";

function formatoMoneda(valor: number) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

// Los emojis se escriben como escapes Unicode (\u{...}) en lugar del
// caracter literal. Esto es a prueba de balas frente a editores/sistemas
// que no guardan el archivo en UTF-8 (Windows-1252, Latin-1, etc.), que es
// lo que estaba convirtiendo cada emoji en un caracter de reemplazo roto.
// Un escape es puro texto ASCII, así que no se puede corromper al guardar el archivo.
const EMOJI = {
  recibo: "\u{1F9FE}", // 🧾
  memo: "\u{1F4DD}", // 📝
  dinero: "\u{1F4B0}", // 💰
  reloj: "\u{1F552}", // 🕒
  arroz: "\u{1F35A}", // 🍚
  camaron: "\u{1F364}", // 🍤
  dumpling: "\u{1F95F}", // 🥟
  cebolla: "\u{1F9C5}", // 🧅
  fideos: "\u{1F35C}", // 🍜
  wok: "\u{1F958}", // 🥘
  sopa: "\u{1F372}", // 🍲
  hamburguesa: "\u{1F354}", // 🍔
  perroCaliente: "\u{1F32D}", // 🌭
  papas: "\u{1F35F}", // 🍟
  pollo: "\u{1F357}", // 🍗
  carne: "\u{1F969}", // 🥩
  huevo: "\u{1F95A}", // 🥚
  vaso: "\u{1F964}", // 🥤
  cerveza: "\u{1F37A}", // 🍺
  agua: "\u{1F4A7}", // 💧
  palillos: "\u{1F962}", // 🥢
  plato: "\u{1F37D}\u{FE0F}", // 🍽️
} as const;

/**
 * Detecta un emoji de comida acorde al nombre del producto/variante.
 * El orden importa: las palabras más específicas van primero para que,
 * por ejemplo, "Arroz Chino + Camarón y Palmitos" tome el de camarón y no el de arroz.
 */
const EMOJIS_POR_PALABRA_CLAVE: [RegExp, string][] = [
  [/camar[oó]n|frutos del mar|palmitos|calamar|pulpo|conchit/i, EMOJI.camaron],
  [/wonton|lumpia|rollito/i, EMOJI.dumpling],
  [/aros? de cebolla/i, EMOJI.cebolla],
  [/chow ?mein|fideos|pasta/i, EMOJI.fideos],
  [/chow ?suey|mazorcada|salteado/i, EMOJI.wok],
  [/crema de pollo|crema de champi|sopa/i, EMOJI.sopa],
  [/hamburguesa/i, EMOJI.hamburguesa],
  [/perro caliente|combo perro/i, EMOJI.perroCaliente],
  [/salchipapa|papa francesa|papas? a la francesa/i, EMOJI.papas],
  [/alitas?/i, EMOJI.pollo],
  [/pollo|pechuga/i, EMOJI.pollo],
  [/costilla|lomo|cerdo|chuleta|churrasco|carnes? ahumada/i, EMOJI.carne],
  [/huevos? de codorniz/i, EMOJI.huevo],
  [/arroz/i, EMOJI.arroz],
  [/gaseosa|jugo|hit|postob[oó]n|colombiana/i, EMOJI.vaso],
  [/cerveza|poker|pola|cola y pola/i, EMOJI.cerveza],
  [/agua/i, EMOJI.agua],
  [/palillos/i, EMOJI.palillos],
];

export function emojiParaProducto(nombre: string): string {
  for (const [patron, emoji] of EMOJIS_POR_PALABRA_CLAVE) {
    if (patron.test(nombre)) return emoji;
  }
  return EMOJI.plato;
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

  let mensaje = `${EMOJI.recibo} Nuevo Pedido\n\n`;
  mensaje += `Mesa: ${cliente.mesa}\n`;
  mensaje += `Cliente: ${cliente.nombre}\n\n`;
  mensaje += `Pedido:\n${lineasPedido}\n\n`;

  if (cliente.observaciones?.trim()) {
    mensaje += `${EMOJI.memo} Observaciones:\n${cliente.observaciones.trim()}\n\n`;
  }

  mensaje += `${EMOJI.dinero} Total:\n${formatoMoneda(total)}\n\n`;
  mensaje += `${EMOJI.reloj} Hora:\n${hora}`;

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
