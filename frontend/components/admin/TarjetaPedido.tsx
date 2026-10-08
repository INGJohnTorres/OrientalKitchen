"use client";

import { Clock } from "lucide-react";
import clsx from "clsx";
import { EstadoPedido, Pedido } from "@/lib/types";
import { etiquetaTipoPedido } from "@/lib/pedido-utils";

// A partir de este tiempo (en minutos) un pedido activo se marca en rojo.
const MINUTOS_DE_ALERTA = 10;

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

/** Texto corto del tiempo de espera: "5 min", "1 h 20 min". */
function textoEspera(minutos: number) {
  if (minutos < 1) return "ahora";
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * Tarjeta de un pedido activo, pensada para tocarse en tablet: número grande,
 * tiempo de espera (rojo si pasa de 10 min) y botones de 56 px.
 */
export default function TarjetaPedido({
  pedido,
  minutos,
  onCambiarEstado,
}: {
  pedido: Pedido;
  minutos: number;
  onCambiarEstado: (id: string, estado: EstadoPedido) => void;
}) {
  const tarde = minutos >= MINUTOS_DE_ALERTA;

  return (
    <article className="flex flex-col gap-3.5 rounded-[22px] border border-cream/10 bg-tarjeta p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-[28px] leading-none">#{pedido.numero}</span>
        <span
          className={clsx(
            "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[15px] font-semibold tabular-nums",
            tarde ? "bg-ember font-bold text-white" : "bg-cream/10 text-cream/90"
          )}
          title={tarde ? "Lleva más de 10 minutos" : undefined}
        >
          <Clock size={17} strokeWidth={2.2} />
          {textoEspera(minutos)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-mustard/15 px-3.5 py-1.5 text-base font-bold text-mustard-claro">
          {etiquetaTipoPedido(pedido)}
        </span>
        <span className="text-lg font-semibold">{pedido.cliente}</span>
      </div>

      <ul className="flex flex-col gap-2 border-y-2 border-dashed border-cream/15 py-3.5">
        {pedido.items.map((item) => (
          <li key={item.claveUnica} className="flex gap-3 text-lg leading-snug">
            <span className="min-w-[28px] font-bold text-ember-claro">{item.cantidad}×</span>
            <span>{item.nombre}</span>
          </li>
        ))}
      </ul>

      {pedido.observaciones && (
        <p className="rounded-xl bg-mustard/10 px-3.5 py-2.5 text-[15px] italic leading-snug text-mustard-claro">
          “{pedido.observaciones}”
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[15px] text-cream/60">Total</span>
        <span className="text-[22px] font-bold tabular-nums">{formatoMoneda(pedido.total)}</span>
      </div>

      {pedido.estado === "nuevo" && (
        <div className="flex gap-2.5">
          <button
            onClick={() => onCambiarEstado(pedido.id, "preparando")}
            className="h-14 flex-1 rounded-2xl bg-ember text-lg font-bold text-white transition active:scale-[0.98]"
          >
            Aceptar pedido
          </button>
          <button
            onClick={() => onCambiarEstado(pedido.id, "cancelado")}
            className="h-14 rounded-2xl border-2 border-cream/20 px-5 text-base font-semibold text-cream/80 transition active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      )}

      {pedido.estado === "preparando" && (
        <>
          <button
            onClick={() => onCambiarEstado(pedido.id, "listo")}
            className="h-14 rounded-2xl bg-mustard text-lg font-bold text-espresso transition active:scale-[0.98]"
          >
            Marcar como listo
          </button>
          <button
            onClick={() => onCambiarEstado(pedido.id, "cancelado")}
            className="min-h-[44px] self-center px-4 text-sm font-medium text-cream/55 underline decoration-dashed underline-offset-4"
          >
            Cancelar pedido
          </button>
        </>
      )}

      {pedido.estado === "listo" && (
        <>
          <button
            onClick={() => onCambiarEstado(pedido.id, "entregado")}
            className="h-14 rounded-2xl bg-olive text-lg font-bold text-white transition active:scale-[0.98]"
          >
            Entregado
          </button>
          <button
            onClick={() => onCambiarEstado(pedido.id, "cancelado")}
            className="min-h-[44px] self-center px-4 text-sm font-medium text-cream/55 underline decoration-dashed underline-offset-4"
          >
            Cancelar pedido
          </button>
        </>
      )}
    </article>
  );
}
