"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Yuji_Syuku } from "next/font/google";
import { obtenerCategorias, obtenerProductos } from "@/lib/api";
import { Categoria, Producto } from "@/lib/types";

// Fuente del lettering "Oriental Kitchen" de la tarjeta de marca — caligrafía
// oriental con serifas afiladas, elegida entre varias opciones probadas en
// Lovable para acercarse al logo de referencia del negocio.
const yujiSyuku = Yuji_Syuku({ weight: "400", subsets: ["latin"] });

// Cuánto tiempo se queda cada plato en pantalla (ms). Suficiente para leer
// nombre + descripción + precio con calma, sin sentirse eterno.
const DURACION_SLIDE_MS = 8000;
// La tarjeta de marca es más corta: no hay texto que leer, solo una pausa.
const DURACION_BUMPER_MS = 5000;

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

  // Rotación con un slot extra al principio (índice 0) para la tarjeta de
  // marca: slot 0 = logo grande, slots 1..N = platos. Así la vitrina abre
  // con la marca y la repite cada vuelta completa del carrusel.
  const totalSlots = platosVitrina.length > 0 ? platosVitrina.length + 1 : 0;
  const esBumper = indice === 0;
  const duracionActual = esBumper ? DURACION_BUMPER_MS : DURACION_SLIDE_MS;

  useEffect(() => {
    if (totalSlots === 0) return;
    const timeout = setTimeout(() => {
      setIndice((i) => (i + 1) % totalSlots);
      setProgresoKey((k) => k + 1);
    }, duracionActual);
    return () => clearTimeout(timeout);
  }, [indice, totalSlots, duracionActual]);

  if (totalSlots === 0) {
    return <main className="grid min-h-screen place-items-center bg-espresso text-cream/40">Cargando menú...</main>;
  }

  // Logo, fijo sobre todo lo demás — no se muestra durante la tarjeta de
  // marca (ya es el protagonista completo de esa pantalla).
  const logoEsquina = !esBumper && (
    <div className="absolute left-8 top-8 z-20">
      <Image src="/logo-favoritos.png" alt="Oriental Kitchen" width={1264} height={713} className="h-16 w-auto drop-shadow-lg" priority />
    </div>
  );

  const barraProgreso = (
    <div className="absolute inset-x-8 bottom-6 z-20 md:inset-x-14">
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-cream/15">
        <div
          key={progresoKey}
          className="h-full rounded-full bg-mustard"
          style={{ animation: `avanzar ${duracionActual}ms linear forwards` }}
        />
      </div>
      <span className="font-mono text-xs text-cream/40">
        {esBumper ? "Oriental Kitchen" : `${indice} / ${platosVitrina.length}`}
      </span>
    </div>
  );

  if (esBumper) {
    return (
      <main className="relative grid h-screen w-screen place-items-center overflow-hidden bg-espresso">
        <div key="bumper" className="flex flex-col items-center animate-[fadeIn_1s_ease-out]">
          <span
            className={`${yujiSyuku.className} ok-ink text-[10vw] leading-none sm:text-7xl lg:text-8xl`}
            data-text="ORIENTAL KITCHEN"
          >
            <span className="ok-fill">ORIENTAL KITCHEN</span>
          </span>

          <div className="ok-rule my-4 w-2/3" />

          <span
            className={`${yujiSyuku.className} ok-ink ok-ink-thin italic text-[3.4vw] leading-none sm:text-2xl lg:text-3xl`}
            data-text="Los expertos en arroz..."
          >
            <span className="ok-fill">Los expertos en arroz...</span>
          </span>

          <Image
            src="/logo-mascota.png"
            alt=""
            width={1264}
            height={448}
            className="mt-2 w-[38vw] max-w-lg"
            priority
          />
        </div>
        {barraProgreso}
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

          .ok-ink { position: relative; display: inline-block; color: #2a1410; }
          .ok-ink > .ok-fill {
            position: relative;
            z-index: 1;
            color: transparent;
            background-image: linear-gradient(to bottom, #e2574c 0%, #b3352c 48%, #7a1f1f 100%);
            -webkit-background-clip: text;
            background-clip: text;
          }
          .ok-ink::before {
            content: attr(data-text);
            position: absolute;
            inset: 0;
            z-index: 0;
            color: #2a1410;
            -webkit-text-stroke: 0.075em #c9a24b;
            paint-order: stroke fill;
            text-shadow: 0 1px 0 #6b5220, 0 2px 0 #4a3814, 0 3px 6px rgba(0,0,0,.7), 0 -1px 0 rgba(255,236,178,.45);
          }
          .ok-ink-thin::before { -webkit-text-stroke-width: 0.045em; }
          .ok-rule {
            height: 2px;
            background: linear-gradient(to right, transparent, #c9a24b 18%, #f0dda0 50%, #c9a24b 82%, transparent);
          }

          @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
        `}</style>
      </main>
    );
  }

  const plato = platosVitrina[indice - 1];
  const categoria = categorias.find((c) => c.id === plato.categoriaId);

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-espresso md:flex-row">
      {logoEsquina}

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
      </div>

      {barraProgreso}

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
