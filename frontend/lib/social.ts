/**
 * Enlaces de contacto/redes del restaurante, centralizados aquí para que no
 * queden números o URLs sueltos repetidos por todo el código.
 */

export function numeroWhatsApp(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
}

export function urlWhatsAppMensaje(mensaje: string): string {
  return `https://wa.me/${numeroWhatsApp()}?text=${encodeURIComponent(mensaje)}`;
}

export const MENSAJE_CONTACTO_RAPIDO =
  "Hola, quiero realizar un pedido. Me gustaría recibir información sobre el menú.";

export const redes = {
  whatsapp: () => urlWhatsAppMensaje(MENSAJE_CONTACTO_RAPIDO),
  facebook: "https://www.facebook.com/p/Oriental-Kitchen-100063602407527/",
  instagram: "https://www.instagram.com/oriental.kitchen_/",
};
