"use client";

import Image from "next/image";
import { Minus, Plus, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Producto } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { usePlan, permitePedidos } from "@/lib/plan";
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

/**
 * Control único para pedir un plato: "Agregar" y, una vez agregado, el mismo
 * botón se vuelve un contador − N +. La cantidad vive en el carrito (no hay
 * un selector aparte), así lo que se ve en la tarjeta es lo que lleva el pedido.
 */
function ControlAgregar({
  nombre,
  cantidad,
  onAgregar,
  onSumar,
  onRestar,
  compacto = false,
}: {
  nombre: string;
  cantidad: number;
  onAgregar: () => void;
  onSumar: () => void;
  onRestar: () => void;
  compacto?: boolean;
}) {
  const alto = compacto ? "h-11" : "h-12";
  const lado = compacto ? "w-11" : "w-12";

  if (cantidad === 0) {
    return (
      <button
        onClick={onAgregar}
        aria-label={`Agregar ${nombre} al pedido`}
        className={clsx(
          "flex items-center justify-center gap-1.5 rounded-full bg-ember text-sm font-bold text-white transition hover:bg-ember-dark active:scale-95",
          alto,
          compacto ? "px-4" : "w-full text-[15px]"
        )}
      >
        <Plus size={compacto ? 16 : 18} strokeWidth={2.8} />
        Agregar
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Cantidad de ${nombre}`}
      className={clsx(
        "flex items-center justify-between overflow-hidden rounded-full border-2 border-ember bg-ember/15",
        alto,
        compacto ? "min-w-[116px]" : "w-full"
      )}
    >
      <button
        onClick={onRestar}
        aria-label={`Quitar una unidad de ${nombre}`}
        className={clsx("grid h-full place-items-center text-cream transition active:bg-cream/10", lado)}
      >
        <Minus size={18} strokeWidth={2.8} />
      </button>
      <span aria-live="polite" className="font-display text-lg tabular-nums text-cream">
        {cantidad}
      </span>
      <button
        onClick={onSumar}
        aria-label={`Sumar una unidad de ${nombre}`}
        className={clsx("grid h-full place-items-center bg-ember text-white transition active:bg-ember-dark", lado)}
      >
        <Plus size={18} strokeWidth={2.8} />
      </button>
    </div>
  );
}

export default function ProductCard({ producto }: { producto: Producto }) {
  const [varianteId, setVarianteId] = useState(producto.variantes?.[0]?.id ?? null);
  const agregar = useCartStore((s) => s.agregar);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const plan = usePlan();
  const puedePedir = plan === null || permitePedidos(plan);

  const variante = useMemo(
    () => producto.variantes?.find((v) => v.id === varianteId) ?? null,
    [producto.variantes, varianteId]
  );

  const precioFinal = variante?.precio ?? producto.precio;
  const nombreFinal = variante && variante.nombre !== "Solo" ? `${producto.nombre} — ${variante.nombre}` : producto.nombre;
  const claveUnica = `${producto.id}::${varianteId ?? "base"}`;

  // Cantidad de la variante elegida (la que muestra el contador) y total del
  // plato en el carrito, sumando todas sus variantes (para marcar la tarjeta).
  const cantidad = useCartStore((s) => s.items.find((i) => i.claveUnica === claveUnica)?.cantidad ?? 0);
  const totalPlato = useCartStore((s) =>
    s.items.reduce((acc, i) => (i.productoId === producto.id ? acc + i.cantidad : acc), 0)
  );
  const enCarrito = totalPlato > 0;
  // Unidades del mismo plato en otras variantes (para avisar al cambiar de opción).
  const enOtraOpcion = totalPlato - cantidad;

  function handleAgregar() {
    agregar({
      claveUnica,
      productoId: producto.id,
      nombre: nombreFinal,
      imagen: producto.imagen,
      precioUnitario: precioFinal,
    });
  }

  const control = puedePedir && (
    <ControlAgregar
      nombre={nombreFinal}
      cantidad={cantidad}
      onAgregar={handleAgregar}
      onSumar={() => cambiarCantidad(claveUnica, cantidad + 1)}
      onRestar={() => cambiarCantidad(claveUnica, cantidad - 1)}
    />
  );

  const sinFoto = !producto.imagen;

  // Formato lista compacta, igual que la sección "Porciones" de la carta física (sin foto).
  if (sinFoto) {
    return (
      <div
        className={clsx(
          "flex items-center gap-3 rounded-2xl border bg-surface/60 px-4 py-3",
          enCarrito ? "border-ember" : "border-espresso/8 dark:border-cream/10"
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-tight">{producto.nombre}</p>
          <p className="truncate text-xs text-espresso/60 dark:text-cream/60">{producto.descripcion}</p>
          <p className="mt-0.5 whitespace-nowrap text-sm font-bold text-ember-dark dark:text-ember-claro">
            {formatoMoneda(producto.precio)}
          </p>
        </div>
        {puedePedir && (
          <ControlAgregar
            compacto
            nombre={producto.nombre}
            cantidad={cantidad}
            onAgregar={handleAgregar}
            onSumar={() => cambiarCantidad(claveUnica, cantidad + 1)}
            onRestar={() => cambiarCantidad(claveUnica, cantidad - 1)}
          />
        )}
      </div>
    );
  }

  // Tarjeta con foto: foto arriba, datos y, al pie, un único control de pedir.
  return (
    <div
      className={clsx(
        "group flex flex-col overflow-hidden rounded-[20px] bg-surface shadow-md shadow-black/20 transition",
        enCarrito ? "ring-2 ring-ember" : "hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div className="relative h-[118px] w-full overflow-hidden sm:h-36">
        <Image
          src={producto.imagen!}
          alt={producto.nombre}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
          quality={90}
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {producto.etiquetas?.map((e) => (
            <span key={e} className={clsx("rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide", colorEtiqueta[e])}>
              {e}
            </span>
          ))}
        </div>

        {enCarrito && (
          <span
            aria-hidden
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ember text-white shadow-md"
          >
            <Check size={15} strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="min-h-[2rem] font-display text-sm font-semibold leading-tight text-cream">{producto.nombre}</h3>
        <p className="line-clamp-2 text-xs leading-snug text-cream/70">
          {variante?.descripcion || producto.descripcion}
        </p>

        {producto.variantes && producto.variantes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {producto.variantes.map((v) => (
              <button
                key={v.id}
                onClick={() => setVarianteId(v.id)}
                aria-pressed={varianteId === v.id}
                className={clsx(
                  "flex min-h-[36px] items-center gap-1 rounded-full border px-3 text-xs font-semibold transition",
                  varianteId === v.id
                    ? "border-ember bg-ember/15 text-ember-claro"
                    : "border-cream/20 text-cream/65 hover:border-ember/50"
                )}
              >
                {varianteId === v.id && <Check size={12} />}
                {v.nombre}
              </button>
            ))}
          </div>
        )}

        <span className="mt-auto whitespace-nowrap pt-1 text-base font-bold tabular-nums text-ember-claro">
          {formatoMoneda(precioFinal)}
        </span>
        {puedePedir && enOtraOpcion > 0 && (
          <p className="text-[11px] font-semibold text-mustard-claro">
            Ya llevas {enOtraOpcion} con otra opción
          </p>
        )}
        {control}
      </div>
    </div>
  );
}
