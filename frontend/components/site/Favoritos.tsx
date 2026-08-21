"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { obtenerProductos } from "@/lib/api";
import { Producto } from "@/lib/types";
import { usePlan, permitePedidos } from "@/lib/plan";
import Reveal from "./Reveal";

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export default function Favoritos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const plan = usePlan();
  const puedePedir = plan === null || permitePedidos(plan);

  useEffect(() => {
    obtenerProductos().then((todos) => {
      const favoritos = todos.filter((p) => p.destacado || p.masVendido).slice(0, 8);
      setProductos(favoritos);
    });
  }, []);

  if (productos.length === 0) return null;

  return (
    <section id="favoritos" className="relative scroll-mt-20 bg-espresso px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-mustard">Los que no fallan</p>
          <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">Nuestros Favoritos</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/60">
            Lo que más piden nuestros clientes — y lo que probablemente vas a terminar pidiendo tú también.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Link
                href={`/menu?categoria=${p.categoriaId}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-cocoa shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-ember/10"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {p.imagen && (
                    <Image
                      src={p.imagen}
                      alt={p.nombre}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={90}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa via-transparent to-transparent" />
                  <span
                    className={clsx(
                      "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-cream",
                      p.masVendido ? "bg-ember" : "bg-mustard text-espresso"
                    )}
                  >
                    {p.masVendido ? "Más pedido" : "Favorito"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-display text-base leading-tight text-cream">{p.nombre}</h3>
                  <p className="line-clamp-2 flex-1 text-sm text-cream/55">{p.descripcion}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-mustard">
                      {formatoMoneda(p.precio)}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-ember transition group-hover:gap-2">
                      {puedePedir ? "Pedir" : "Ver"} <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
