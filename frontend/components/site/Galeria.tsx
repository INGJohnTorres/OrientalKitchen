"use client";

import Image from "next/image";
import { Expand } from "lucide-react";
import clsx from "clsx";
import Reveal from "./Reveal";

const FOTOS = [
  { src: "/productos/arroz-paisa.jpg", alt: "Arroz Super Paisa", texto: "Super Paisa", grande: true },
  { src: "/productos/camarones.jpg", alt: "Camarones O.K.", texto: "Camarones O.K." },
  { src: "/productos/valenciano.jpg", alt: "Arroz Valenciano", texto: "Valenciano" },
  { src: "/productos/churrasco.jpg", alt: "Churrasco a la plancha", texto: "Churrasco" },
  { src: "/productos/frutos-del-mar.jpg", alt: "Arroz Frutos del Mar", texto: "Frutos del Mar", grande: true },
  { src: "/productos/pollo-agridulce.jpg", alt: "Pollo Agridulce O.K.", texto: "Pollo Agridulce" },
  { src: "/productos/wonton.jpg", alt: "Wonton Frito", texto: "Wonton Frito" },
  { src: "/productos/hamburguesa.jpg", alt: "Hamburguesa de la casa", texto: "Hamburguesa" },
];

export default function Galeria() {
  return (
    <section className="bg-cocoa px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard">Directo del wok</p>
          <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">Galería</h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {FOTOS.map((foto, i) => (
            <Reveal
              key={foto.src + i}
              delay={i * 50}
              className={clsx(foto.grande && "col-span-2 row-span-2")}
            >
              <div
                className={clsx(
                  "group relative w-full overflow-hidden rounded-xl",
                  foto.grande ? "aspect-square" : "aspect-square"
                )}
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-espresso/0 opacity-0 transition-all duration-300 group-hover:bg-espresso/60 group-hover:opacity-100">
                  <Expand size={20} className="text-cream" />
                  <span className="px-2 text-center text-sm font-medium text-cream">{foto.texto}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
