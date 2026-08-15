"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin } from "lucide-react";

// Ícono de pin personalizado (evita el problema clásico de Leaflet + Next.js
// donde los íconos por defecto no cargan por las rutas de assets del bundler).
const iconoPin = L.divIcon({
  className: "",
  html: `<svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.5 17 25 17 25s17-12.5 17-25C34 7.6 26.4 0 17 0z" fill="#D2232A"/>
    <circle cx="17" cy="17" r="7" fill="#F5F1E6"/>
  </svg>`,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

const BOGOTA: [number, number] = [4.711, -74.0721];

interface Props {
  onCambiar: (datos: { lat: number; lng: number; direccion: string }) => void;
}

function ClicMapa({ onClic }: { onClic: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClic(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapaUbicacion({ onCambiar }: Props) {
  const [posicion, setPosicion] = useState<[number, number]>(BOGOTA);
  const [direccion, setDireccion] = useState("");
  const [cargandoDireccion, setCargandoDireccion] = useState(false);
  const [ubicando, setUbicando] = useState(false);

  async function actualizarPosicion(lat: number, lng: number) {
    setPosicion([lat, lng]);
    setCargandoDireccion(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const texto: string = data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setDireccion(texto);
      onCambiar({ lat, lng, direccion: texto });
    } catch {
      const texto = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setDireccion(texto);
      onCambiar({ lat, lng, direccion: texto });
    } finally {
      setCargandoDireccion(false);
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        actualizarPosicion(pos.coords.latitude, pos.coords.longitude);
        setUbicando(false);
      },
      () => setUbicando(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Ubica al cliente automáticamente la primera vez que aparece el mapa, si
  // el navegador ya tiene permiso concedido (si no, simplemente se queda en
  // el centro de Bogotá y el usuario mueve el pin a mano).
  useEffect(() => {
    usarMiUbicacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm">Marca tu ubicación en el mapa</label>
        <button
          type="button"
          onClick={usarMiUbicacion}
          className="flex items-center gap-1 text-xs font-semibold text-ember"
        >
          <LocateFixed size={13} className={ubicando ? "animate-pulse" : ""} />
          Usar mi ubicación
        </button>
      </div>

      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-espresso/20 dark:border-cream/20">
        <MapContainer center={posicion} zoom={15} className="h-full w-full" attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={posicion}
            draggable
            icon={iconoPin}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                actualizarPosicion(lat, lng);
              },
            }}
          />
          <ClicMapa onClic={actualizarPosicion} />
        </MapContainer>
      </div>

      <div className="flex items-start gap-1.5 rounded-lg bg-espresso/5 px-3 py-2 text-xs text-espresso/60 dark:bg-cream/5 dark:text-cream/60">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        <span>{cargandoDireccion ? "Buscando dirección..." : direccion || "Toca o arrastra el pin para marcar el punto exacto."}</span>
      </div>
    </div>
  );
}
