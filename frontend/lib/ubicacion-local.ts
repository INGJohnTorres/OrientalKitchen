// Ubicación real del local (tomada del link de Google Maps del negocio:
// Oriental Kitchen, Cl. 30 #2-10, Soacha, Cundinamarca). Punto de referencia
// único para el mapa del local (MapaLocal) y para calcular el costo de
// domicilio según la distancia hasta la dirección del cliente.
export const UBICACION_LOCAL = {
  lat: 4.5842755,
  lng: -74.2052157,
  nombre: "Oriental Kitchen",
};

// Domicilios hasta este radio cobran el valor base; más lejos, el valor alto.
const RADIO_DOMICILIO_BASE_KM = 2;
const COSTO_DOMICILIO_BASE = 2000;
const COSTO_DOMICILIO_LEJOS = 3000;

/** Distancia en línea recta entre dos puntos (fórmula de Haversine), en km. */
function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Costo del domicilio según qué tan lejos del local quede la dirección del cliente. */
export function calcularCostoDomicilio(latCliente: number, lngCliente: number): number {
  const distancia = distanciaKm(UBICACION_LOCAL.lat, UBICACION_LOCAL.lng, latCliente, lngCliente);
  return distancia <= RADIO_DOMICILIO_BASE_KM ? COSTO_DOMICILIO_BASE : COSTO_DOMICILIO_LEJOS;
}
