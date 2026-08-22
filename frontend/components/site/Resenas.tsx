"use client";

import { Star, ExternalLink } from "lucide-react";
import Reveal from "./Reveal";

// Link público de Google (share.google) a las opiniones del negocio.
const LINK_RESENAS_GOOGLE = "https://share.google/ENCPpGwpJ75VXWGnf";
const CALIFICACION_GOOGLE = 4.7;
const TOTAL_OPINIONES = 86;

// Reseñas reales del negocio en Google, con calificación de 4 estrellas o
// más (las únicas que se muestran aquí a propósito) — transcritas tal cual
// las escribió cada cliente, solo recortadas si eran muy largas. Ordenadas
// de más reciente a más antigua ("hace" según Google al momento de
// copiarlas). Esta lista es una foto fija: Google no da una API gratis
// para traerlas en vivo, así que hay que pedir que se vuelva a revisar de
// vez en cuando para traer las más nuevas.
const RESENAS = [
  {
    autor: "Diego López",
    estrellas: 5,
    hace: "Hace 1 mes",
    texto:
      "El repartidor siempre es super amable, la comida deliciosa con muy buena sazón, los precios económicos. El arroz viene con bastantes carnes, hay muchas opciones.",
  },
  {
    autor: "Hitan Brian Velásquez",
    estrellas: 5,
    hace: "Hace 1 mes",
    texto: "Ufff la verdad es tan rico 😮‍💨😍 el sabor todo, la cantidad es la perfecta.",
  },
  {
    autor: "Alison Vargas Olaya",
    estrellas: 5,
    hace: "Hace 1 mes",
    texto:
      "El mejor arroz chino que he probado, la comida es un 10/10, atienden de una manera muy amable, y los domiciliarios tienen la mejor actitud ❤️.",
  },
  {
    autor: "Lucena Orjuela",
    estrellas: 5,
    hace: "Hace 1 mes",
    texto:
      "Fuimos el fin de semana con mi familia y nos encantó la atención, la comida, lo cómodo, fue súper rápido y el precio muy razonable. Volvería mil veces. 😋",
  },
  {
    autor: "Alfredo Romero",
    estrellas: 5,
    hace: "Hace 2 meses",
    texto:
      "Han sido muy buenas nuestras experiencias con este restaurante, hemos pedido a domicilio y nos ha ido muy bien, recomendados.",
  },
  {
    autor: "Fernanda García",
    estrellas: 5,
    hace: "Hace 3 meses",
    texto: "Muy rico y el arroz paisa es delicioso 😋.",
  },
  {
    autor: "John Guzmán",
    estrellas: 5,
    hace: "Hace 8 meses",
    texto: "Muy buen lugar para disfrutar un plato rico 😋 y de buen precio, la atención es genial.",
  },
  {
    autor: "Julian Enrique Gil Peña",
    estrellas: 5,
    hace: "Hace 11 meses",
    texto:
      "Ya hace mucho tiempo llevo adquiriendo sus preparaciones, excelente servicio, atención agradable y deliciosas recetas. Atentos y rápidos a la hora de entregar domicilios.",
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

function TarjetaResena({ resena }: { resena: (typeof RESENAS)[number] }) {
  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col gap-3 rounded-2xl border border-cream/10 bg-cocoa/60 p-6 transition hover:border-mustard/30 hover:bg-cocoa sm:w-[340px]">
      <div className="flex items-center justify-between">
        <Estrellas cantidad={resena.estrellas} />
        <span className="font-mono text-[11px] text-cream/40">{resena.hace}</span>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-cream/75">"{resena.texto}"</p>
      <p className="font-display text-sm text-cream/90">{resena.autor}</p>
    </div>
  );
}

export default function Resenas() {
  // Se duplica la lista para que la animación de desplazamiento pueda
  // repetirse sin salto: al llegar a -50% queda exactamente donde empezó
  // la copia, así que el "corte" es invisible.
  const filaDoble = [...RESENAS, ...RESENAS];

  return (
    <section className="relative overflow-hidden bg-espresso py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl px-5">
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
      </div>

      {/* Fila con desplazamiento infinito — se pausa al pasar el mouse.
          Los degradados de los costados disimulan dónde entran/salen las
          tarjetas de la pantalla. */}
      <div className="resenas-marquee-mask relative w-full overflow-hidden">
        <div className="resenas-marquee flex w-max gap-5 px-5">
          {filaDoble.map((resena, i) => (
            <TarjetaResena key={`${resena.autor}-${i}`} resena={resena} />
          ))}
        </div>
      </div>

      <Reveal className="mt-10 flex justify-center px-5">
        <a
          href={LINK_RESENAS_GOOGLE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border-2 border-mustard px-6 py-3 text-sm font-semibold text-mustard transition hover:scale-105 hover:bg-mustard hover:text-espresso"
        >
          Ver todas las reseñas en Google <ExternalLink size={15} />
        </a>
      </Reveal>

      <style>{`
        .resenas-marquee {
          animation: resenas-desplazar 50s linear infinite;
        }
        .resenas-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes resenas-desplazar {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .resenas-marquee-mask {
          -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
          mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .resenas-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
