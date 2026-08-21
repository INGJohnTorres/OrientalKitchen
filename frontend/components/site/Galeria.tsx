"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import clsx from "clsx";
import { obtenerProductos } from "@/lib/api";
import { Producto } from "@/lib/types";
import Reveal from "./Reveal";

const TAMANIO_GRILLA = 8;
// Igual que el layout original: la 1ra y la 5ta celda ocupan 2x2, sin importar qué foto caiga ahí.
const POSICIONES_GRANDES = new Set([0, 4]);
const INTERVALO_ROTACION_MS = 6000;

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function Galeria() {
  const [pool, setPool] = useState<Producto[]>([]);
  const [offset, setOffset] = useState(0);

  // Se toman las fotos reales del menú (no una lista fija) y se barajan una
  // vez al cargar, para que cada visita muestre un orden distinto.
  useEffect(() => {
    obtenerProductos().then((productos) => {
      setPool(barajar(productos.filter((p) => p.imagen)));
    });
  }, []);

  // Si hay más fotos de las que caben en la grilla, se van rotando solas
  // cada pocos segundos para que no sean siempre las mismas 8.
  useEffect(() => {
    if (pool.length <= TAMANIO_GRILLA) return;
    const intervalo = setInterval(() => {
      setOffset((o) => (o + 1) % pool.length);
    }, INTERVALO_ROTACION_MS);
    return () => clearInterval(intervalo);
  }, [pool.length]);

  if (pool.length === 0) return null;

  const visibles = Array.from(
    { length: Math.min(TAMANIO_GRILLA, pool.length) },
    (_, i) => pool[(offset + i) % pool.length]
  );

  return (
    <section className="bg-cocoa px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard">Directo del wok</p>
          <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">Galería</h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {visibles.map((producto, i) => (
            <Reveal
              key={producto.id}
              delay={i * 50}
              className={clsx(POSICIONES_GRANDES.has(i) && "col-span-2 row-span-2")}
            >
              <div className="group relative aspect-square w-full overflow-hidden rounded-xl">
                <Image
                  src={producto.imagen!}
                  alt={producto.nombre}
                  fill
                  // Las celdas "grandes" ocupan el doble de ancho (col-span-2):
                  // si el sizes no lo refleja, el navegador pide una imagen más
                  // chica de la que realmente se muestra y se ve borrosa al estirarla.
                  sizes={
                    POSICIONES_GRANDES.has(i)
                      ? "(max-width: 640px) 100vw, 50vw"
                      : "(max-width: 640px) 50vw, 25vw"
                  }
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-espresso/0 opacity-0 transition-all duration-300 group-hover:bg-espresso/60 group-hover:opacity-100">
                  <Expand size={20} className="text-cream" />
                  <span className="px-2 text-center text-sm font-medium text-cream">{producto.nombre}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
