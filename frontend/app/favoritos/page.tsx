"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { obtenerCategorias, obtenerProductos } from "@/lib/api";
import { Categoria, Producto } from "@/lib/types";

// Cuánto tiempo se queda cada plato en pantalla (ms). Suficiente para leer
// nombre + descripción + precio con calma, sin sentirse eterno.
const DURACION_SLIDE_MS = 8000;

const colorEtiqueta: Record<string, string> = {
  Nuevo: "bg-olive text-cream",
  Picante: "bg-ember text-cream",
  Vegetariano: "bg-olive/80 text-cream",
  Promoción: "bg-mustard text-espresso",
};

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export default function PantallaFavoritos() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [indice, setIndice] = useState(0);
  const [progresoKey, setProgresoKey] = useState(0);

  useEffect(() => {
    obtenerCategorias().then(setCategorias);
    obtenerProductos().then(setProductos);
  }, []);

  // Todo el menú, sin bebidas y solo platos con foto propia (si un plato no
  // tiene foto no se muestra aquí — mejor eso a mostrar algo borroso o un
  // cuadro vacío en una pantalla grande).
  const platosVitrina = useMemo(() => {
    const ordenCategoria = new Map(categorias.map((c) => [c.id, c.orden]));
    return productos
      .filter((p) => p.activo && p.imagen && p.categoriaId !== "bebidas")
      .sort((a, b) => (ordenCategoria.get(a.categoriaId) ?? 99) - (ordenCategoria.get(b.categoriaId) ?? 99));
  }, [productos, categorias]);

  useEffect(() => {
    if (platosVitrina.length === 0) return;
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % platosVitrina.length);
      setProgresoKey((k) => k + 1);
    }, DURACION_SLIDE_MS);
    return () => clearInterval(intervalo);
  }, [platosVitrina.length]);

  const plato = platosVitrina[indice];
  const categoria = categorias.find((c) => c.id === plato?.categoriaId);

  if (!plato) {
    return <main className="grid min-h-screen place-items-center bg-espresso text-cream/40">Cargando menú...</main>;
  }

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-espresso md:flex-row">
      {/* Logo, fijo sobre todo lo demás */}
      <div className="absolute left-8 top-8 z-20 flex items-center gap-3">
        <div className="relative h-12 w-12">
          <Image src="/logo-ok.png" alt="Oriental Kitchen" fill className="object-contain" />
        </div>
        <span className="font-display text-lg tracking-wide text-cream/90">ORIENTAL KITCHEN</span>
      </div>

      {/* Foto — panel grande, mitad de la pantalla */}
      <div key={plato.id} className="relative h-[46%] w-full animate-[fadeIn_0.9s_ease-out] md:h-full md:w-[58%]">
        <Image
          src={plato.imagen!}
          alt={plato.nombre}
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-espresso/10" />
      </div>

      {/* Texto del plato — panel sólido, mitad de la pantalla */}
      <div
        key={`texto-${plato.id}`}
        className="relative flex flex-1 flex-col justify-center gap-4 bg-espresso px-8 py-8 md:w-[42%] md:px-14"
      >
        <div className="flex flex-wrap items-center gap-2 animate-[slideUp_0.7s_ease-out]">
          {categoria && (
            <span className="rounded-full bg-cream/10 px-3 py-1 text-sm font-medium uppercase tracking-wide text-mustard">
              {categoria.nombre}
            </span>
          )}
          {plato.etiquetas?.map((e) => (
            <span key={e} className={`rounded-full px-3 py-1 text-sm font-semibold ${colorEtiqueta[e]}`}>
              {e}
            </span>
          ))}
          {plato.masVendido && (
            <span className="rounded-full bg-ember px-3 py-1 text-sm font-semibold text-cream">Más pedido</span>
          )}
          {plato.destacado && !plato.masVendido && (
            <span className="rounded-full bg-mustard px-3 py-1 text-sm font-semibold text-espresso">Favorito</span>
          )}
        </div>

        <h1 className="animate-[slideUp_0.8s_ease-out] font-display text-4xl leading-tight text-cream drop-shadow-lg lg:text-6xl">
          {plato.nombre}
        </h1>

        <p className="max-w-xl animate-[slideUp_0.9s_ease-out] text-lg text-cream/80 lg:text-xl">
          {plato.descripcion}
        </p>

        <p className="animate-[slideUp_1s_ease-out] font-mono text-3xl font-semibold text-mustard lg:text-4xl">
          {formatoMoneda(plato.precio)}
        </p>

        {/* Barra de progreso del plato actual + contador */}
        <div className="mt-6">
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-cream/15">
            <div
              key={progresoKey}
              className="h-full rounded-full bg-mustard"
              style={{ animation: `avanzar ${DURACION_SLIDE_MS}ms linear forwards` }}
            />
          </div>
          <span className="font-mono text-xs text-cream/40">
            {indice + 1} / {platosVitrina.length}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes avanzar { from { width: 0%; } to { width: 100%; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
