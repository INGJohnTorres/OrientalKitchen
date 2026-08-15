"use client";

import Image from "next/image";
import { Flame, Leaf, HeartHandshake, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const PILARES = [
  {
    icono: Leaf,
    titulo: "Ingredientes frescos",
    texto: "Vegetales, carnes y camarón seleccionados cada día — nada de sabor artificial.",
  },
  {
    icono: Flame,
    titulo: "Preparación al momento",
    texto: "Cada wok se saltea cuando llega tu pedido, no antes. Así se siente la diferencia.",
  },
  {
    icono: HeartHandshake,
    titulo: "Atención cercana",
    texto: "Te tratamos como parte de la casa, desde que pides hasta el último bocado.",
  },
  {
    icono: Sparkles,
    titulo: "Sabor con identidad",
    texto: "Recetas orientales con el corazón colombiano — una fusión que solo encuentras aquí.",
  },
];

export default function Experiencia() {
  return (
    <section id="nosotros" className="relative scroll-mt-20 overflow-hidden bg-espresso px-5 py-20 sm:py-28">
      <div className="absolute inset-0">
        <Image
          src="/productos/frutos-del-mar.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.08]"
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard">Nuestra cocina</p>
          <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">Más que un plato</h2>
          <p className="mt-3 text-cream/60">
            Detrás de cada wok hay una manera de hacer las cosas — con calma, con calidad, y con ganas
            de que vuelvas.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((pilar, i) => (
            <Reveal key={pilar.titulo} delay={i * 90}>
              <div className="group flex h-full flex-col gap-4 rounded-2xl border border-cream/10 bg-cocoa/60 p-6 transition hover:border-ember/40 hover:bg-cocoa">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-ember/15 text-ember transition group-hover:scale-110 group-hover:bg-ember group-hover:text-cream">
                  <pilar.icono size={22} />
                </div>
                <h3 className="font-display text-base text-cream">{pilar.titulo}</h3>
                <p className="text-sm text-cream/55">{pilar.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
