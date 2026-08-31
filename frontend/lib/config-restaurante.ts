/**
 * CONFIGURACIÓN CENTRAL DEL NEGOCIO
 * ==================================
 * Para adaptar este proyecto a OTRO restaurante, este es el único archivo
 * que necesitas editar para la identidad de marca, contacto y ubicación.
 * (El menú/catálogo de productos vive aparte, en la base de datos — se
 * carga la primera vez con `backend/prisma/seed-data.json`.)
 *
 * Lo que NO se edita aquí porque ya es editable desde el panel admin una
 * vez el sitio está en producción: nombre del negocio, logo, número de
 * WhatsApp y el plan contratado (ver /admin/configuracion) — todo eso vive
 * en la tabla `Configuracion` de la base de datos. Los valores de abajo son
 * el respaldo/valor por defecto que se usa en modo demo (sin backend) y en
 * los metadatos de la página (SEO, título de la pestaña, etc).
 *
 * Los logos e imágenes (panda mascota, fotos de platos) son archivos en
 * frontend/public/ — hay que reemplazarlos por los del nuevo negocio,
 * no se pueden generar solos desde este config.
 */

export const NOMBRE_RESTAURANTE = process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Oriental Kitchen";

export const ESLOGAN = "Los expertos en arroz";

export const DESCRIPCION_CORTA = "Cocina oriental con alma colombiana";

export const DESCRIPCION_SEO =
  "Cocina oriental con alma colombiana en Bogotá. Arroz chino, platos especiales, comida rápida y más. Pide en línea o por WhatsApp, para mesa o domicilio.";

export const PALABRAS_CLAVE_SEO = [
  NOMBRE_RESTAURANTE,
  "arroz chino Bogotá",
  "comida oriental",
  "restaurante asiático",
  "domicilios comida china",
];

/** Número base para WhatsApp, Nequi y Daviplata — sin espacios ni signos. */
export const NUMERO_WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573115243043").replace(/\D/g, "");

export const REDES_SOCIALES = {
  facebook: "https://www.facebook.com/p/Oriental-Kitchen-100063602407527/",
  instagram: "https://www.instagram.com/oriental.kitchen_/",
};

/**
 * Ubicación real del local (tomada del link de Google Maps del negocio).
 * Se usa para el mapa del local (MapaLocal) y para calcular el costo de
 * domicilio según la distancia hasta la dirección del cliente.
 */
export const UBICACION_LOCAL = {
  lat: 4.5842755,
  lng: -74.2052157,
  direccionCorta: "Cl. 30 #2-10, Soacha, Cundinamarca",
};

/**
 * Link público de Google (Compartir → se genera en share.google) a las
 * opiniones del negocio, más el resumen que se muestra junto a la fila de
 * reseñas. Las reseñas individuales (las citas de cada cliente) se editan
 * aparte en components/site/Resenas.tsx — son contenido real de clientes,
 * no configuración, así que hay que reemplazarlas por las del negocio
 * nuevo (con calificación de 4 estrellas o más).
 */
export const RESENAS_GOOGLE = {
  url: "https://share.google/ENCPpGwpJ75VXWGnf",
  calificacion: 4.7,
  totalOpiniones: 86,
};

/**
 * Paleta de marca — también se usa en tailwind.config.ts para generar las
 * clases (bg-ember, text-mustard, etc). Cambiar los valores acá cambia el
 * sitio completo.
 */
export const COLORES = {
  cream: "#F5F1E6",
  parchment: "#E9E4D6",
  espresso: "#121214",
  cocoa: "#1C1B1F",
  surface: "#232227",
  ember: "#D2232A",
  emberDark: "#9C161B",
  mustard: "#D9A441",
  olive: "#2F7A5C",
  clay: "#3A3A3E",
};
