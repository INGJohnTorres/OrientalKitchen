"use client";

import { Star, ExternalLink } from "lucide-react";
import Reveal from "./Reveal";

// Link público de Google (share.google) a las opiniones del negocio.
const LINK_RESENAS_GOOGLE = "https://share.google/ENCPpGwpJ75VXWGnf";
const CALIFICACION_GOOGLE = 4.7;
const TOTAL_OPINIONES = 86;

// Reseñas reales del negocio en Google, con calificación de 4 estrellas o
// más (las únicas que se muestran aquí a propósito). Se transcriben tal
// cual las escribió cada cliente, solo recortadas si eran muy largas.
const RESENAS = [
  {
    autor: "Diego López",
    estrellas: 5,
    texto:
      "El repartidor siempre es super amable, la comida deliciosa con muy buena sazón, los precios económicos. El arroz viene con bastantes carnes, hay muchas opciones.",
  },
  {
    autor: "Alison Vargas Olaya",
    estrellas: 5,
    texto:
      "El mejor arroz chino que he probado, la comida es un 10/10, atienden de una manera muy amable, y los domiciliarios tienen la mejor actitud ❤️.",
  },
  {
    autor: "Lucena Orjuela",
    estrellas: 5,
    texto:
      "Fuimos el fin de semana con mi familia y nos encantó la atención, la comida, lo cómodo, fue súper rápido y el precio muy razonable. Volvería mil veces. 😋",
  },
  {
    autor: "Julian Enrique Gil Peña",
    estrellas: 5,
    texto:
      "Ya hace mucho tiempo llevo adquiriendo sus preparaciones, excelente servicio, atención agradable y deliciosas recetas. Atentos y rápidos a la hora de entregar domicilios.",
  },
  {
    autor: "Alfredo Romero",
    estrellas: 5,
    texto:
      "Han sido muy buenas nuestras experiencias con este restaurante, hemos pedido a domicilio y nos ha ido muy bien, recomendados.",
  },
  {
    autor: "John Guzman",
    estrellas: 5,
    texto: "Muy buen lugar para disfrutar un plato rico 😋 y de buen precio, la atención es genial.",
  },
];

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <div className="flex gap-0.5 text-mustard">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={i < cantidad ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </div>
  );
}

export default function Resenas() {
  return (
    <section className="relative overflow-hidden bg-espresso px-5 py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard">Lo que dicen de nosotros</p>
          <h2 className="font-display text-3xl text-cream sm:text-4xl">Reseñas de verdad, de clientes de verdad</h2>
          <a
            href={LINK_RESENAS_GOOGLE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 rounded-full border border-cream/15 bg-cocoa/60 px-4 py-2 text-sm text-cream/80 transition hover:border-mustard/50 hover:text-cream"
          >
            <Estrellas cantidad={5} />
            <span className="font-semibold">{CALIFICACION_GOOGLE}</span>
            <span className="text-cream/50">· {TOTAL_OPINIONES} opiniones en Google</span>
            <ExternalLink size={14} />
          </a>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESENAS.map((resena, i) => (
            <Reveal key={resena.autor} delay={i * 80}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-cream/10 bg-cocoa/60 p-6 transition hover:border-mustard/30 hover:bg-cocoa">
                <Estrellas cantidad={resena.estrellas} />
                <p className="flex-1 text-sm leading-relaxed text-cream/75">"{resena.texto}"</p>
                <p className="font-display text-sm text-cream/90">{resena.autor}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <a
            href={LINK_RESENAS_GOOGLE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border-2 border-mustard px-6 py-3 text-sm font-semibold text-mustard transition hover:scale-105 hover:bg-mustard hover:text-espresso"
          >
            Ver todas las reseñas en Google <ExternalLink size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
