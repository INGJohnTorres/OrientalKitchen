"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation } from "lucide-react";

// Ubicación real del local (tomada del link de Google Maps del negocio:
// Oriental Kitchen, Cl. 30 #2-10, Soacha, Cundinamarca). A diferencia de
// MapaUbicacion (donde el cliente marca SU dirección para domicilio), este
// mapa es fijo y de solo lectura: muestra dónde queda el local para que el
// cliente sepa a dónde ir a recoger su pedido. El botón "Cómo llegar" sigue
// abriendo Google Maps para las indicaciones reales — Google descontinuó el
// truco de incrustar su mapa sin API key, pero OpenStreetMap (ya usado en
// MapaUbicacion) no tiene ese problema y no requiere ninguna configuración.
const LAT = 4.5842755;
const LNG = -74.2052157;
const NOMBRE_LOCAL = "Oriental Kitchen";

const iconoPin = L.divIcon({
  className: "",
  html: `<svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.5 17 25 17 25s17-12.5 17-25C34 7.6 26.4 0 17 0z" fill="#D2232A"/>
    <circle cx="17" cy="17" r="7" fill="#F5F1E6"/>
  </svg>`,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

export default function MapaLocal() {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm">Ubicación del local</label>

      <div className="h-48 w-full overflow-hidden rounded-xl border border-espresso/20 dark:border-cream/20">
        <MapContainer
          center={[LAT, LNG]}
          zoom={16}
          className="h-full w-full"
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[LAT, LNG]} icon={iconoPin} />
        </MapContainer>
      </div>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-lg bg-espresso/5 px-3 py-2.5 text-sm font-semibold text-ember transition hover:bg-espresso/10 dark:bg-cream/5 dark:hover:bg-cream/10"
      >
        <Navigation size={15} /> Cómo llegar
      </a>
    </div>
  );
}
