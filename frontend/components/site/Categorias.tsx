"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";

const CATEGORIAS_DESTACADAS = [
  { id: "entradas", nombre: "Entradas", emoji: "🥟", imagen: "/productos/wonton.jpg" },
  { id: "arroz-personal", nombre: "Arroz Chino", emoji: "🍚", imagen: "/productos/arroz-personal.jpg" },
  { id: "familiar-4", nombre: "Familiares", emoji: "🍲", imagen: "/productos/arroz-paisa.jpg" },
  { id: "especiales", nombre: "Especiales", emoji: "🥘", imagen: "/productos/pollo-agridulce.jpg" },
  { id: "comida-rapida", nombre: "Comida Rápida", emoji: "🍔", imagen: "/productos/hamburguesa.jpg" },
  { id: "a-la-carta", nombre: "A la Carta", emoji: "🥩", imagen: "/productos/churrasco.jpg" },
  { id: "porciones", nombre: "Porciones", emoji: "🍟", imagen: "/productos/alitas-x4.jpg" },
  { id: "bebidas", nombre: "Bebidas y Cervezas", emoji: "🥤", imagen: "/productos/valenciano.jpg" },
];

export default function Categorias() {
  return (
    <section className="bg-cocoa px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard">Explora</p>
          <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">¿Qué se te antoja hoy?</h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIAS_DESTACADAS.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 60}>
              <Link
                href={`/menu?categoria=${cat.id}`}
                className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-2xl"
              >
                <Image
                  src={cat.imagen}
                  alt={cat.nombre}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent transition group-hover:from-ember/70" />
                <div className="relative z-10 flex flex-col items-center gap-1 pb-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-center font-display text-sm text-cream drop-shadow">
                    {cat.nombre}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
