"use client";

import Image from "next/image";
import { Minus, Plus, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Producto } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import clsx from "clsx";

const colorEtiqueta: Record<string, string> = {
  Nuevo: "bg-olive text-cream",
  Picante: "bg-ember text-cream",
  Vegetariano: "bg-olive/80 text-cream",
  Promoción: "bg-mustard text-espresso",
};

function formatoMoneda(v: number) {
  return (v ?? 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function ProductCard({ producto }: { producto: Producto }) {
  const [cantidad, setCantidad] = useState(1);
  const [varianteId, setVarianteId] = useState(producto.variantes?.[0]?.id ?? null);
  const agregar = useCartStore((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  const variante = useMemo(
    () => producto.variantes?.find((v) => v.id === varianteId) ?? null,
    [producto.variantes, varianteId]
  );

  const precioFinal = variante?.precio ?? producto.precio;
  const nombreFinal = variante && variante.nombre !== "Solo" ? `${producto.nombre} — ${variante.nombre}` : producto.nombre;

  function handleAgregar() {
    agregar(
      {
        claveUnica: `${producto.id}::${varianteId ?? "base"}`,
        productoId: producto.id,
        nombre: nombreFinal,
        imagen: producto.imagen,
        precioUnitario: precioFinal,
      },
      cantidad
    );
    setAgregado(true);
    setCantidad(1);
    setTimeout(() => setAgregado(false), 1200);
  }

  const sinFoto = !producto.imagen;

  // Formato lista compacta, igual que la sección "Porciones" de la carta física (sin foto).
  if (sinFoto) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-espresso/8 bg-surface/60 px-4 py-3 dark:border-cream/10 dark:bg-surface/60">
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight">{producto.nombre}</p>
          <p className="truncate text-xs text-espresso/60 dark:text-cream/60">{producto.descripcion}</p>
        </div>
        <span className="whitespace-nowrap font-mono text-sm font-semibold text-ember-dark dark:text-ember">
          {formatoMoneda(producto.precio)}
        </span>
        <button
          onClick={() =>
            agregar({
              claveUnica: `${producto.id}::base`,
              productoId: producto.id,
              nombre: producto.nombre,
              precioUnitario: producto.precio,
            })
          }
          aria-label="Agregar"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember text-cream shadow-md shadow-ember/30 transition hover:bg-ember-dark active:scale-95"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  // Tarjeta grande estilo "Popular Food": foto amplia arriba, botón circular
  // naranja flotando sobre la esquina inferior de la imagen (acción rápida
  // de agregar) y el contenido (nombre, precio, variantes) debajo.
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-surface shadow-md shadow-black/20 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-36 w-full overflow-hidden sm:h-40">
        <Image
          src={producto.imagen!}
          alt={producto.nombre}
          fill
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {producto.etiquetas?.map((e) => (
            <span key={e} className={clsx("rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide", colorEtiqueta[e])}>
              {e}
            </span>
          ))}
        </div>

        <button
          onClick={handleAgregar}
          aria-label="Agregar"
          className={clsx(
            "absolute -bottom-4 right-3 grid h-10 w-10 place-items-center rounded-full text-cream shadow-lg shadow-ember/40 ring-4 ring-surface transition active:scale-90",
            agregado ? "bg-olive" : "bg-ember hover:bg-ember-dark"
          )}
        >
          {agregado ? <Check size={18} /> : <Plus size={18} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4 pt-6">
        <h3 className="font-display text-base font-semibold leading-tight text-cream">{producto.nombre}</h3>
        <p className="line-clamp-2 text-xs text-cream/60">
          {variante?.descripcion || producto.descripcion}
        </p>

        {producto.variantes && producto.variantes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {producto.variantes.map((v) => (
              <button
                key={v.id}
                onClick={() => setVarianteId(v.id)}
                className={clsx(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  varianteId === v.id
                    ? "border-ember bg-ember/15 text-ember"
                    : "border-cream/15 text-cream/50 hover:border-ember/50"
                )}
              >
                {varianteId === v.id && <Check size={11} />}
                {v.nombre}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="whitespace-nowrap font-mono text-sm font-bold text-ember">
            {formatoMoneda(precioFinal)}
          </span>
          <div className="flex items-center gap-1.5 rounded-full border border-cream/15 px-1 py-1">
            <button
              aria-label="Restar"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="grid h-6 w-6 place-items-center rounded-full text-cream/70 transition hover:bg-cream/10"
            >
              <Minus size={13} />
            </button>
            <span className="w-4 text-center font-mono text-xs text-cream">{cantidad}</span>
            <button
              aria-label="Sumar"
              onClick={() => setCantidad((c) => c + 1)}
              className="grid h-6 w-6 place-items-center rounded-full text-cream/70 transition hover:bg-cream/10"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
