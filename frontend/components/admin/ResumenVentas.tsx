"use client";

import { useMemo } from "react";
import { Pedido } from "@/lib/types";

const DIAS = 7;
const ALTO_MAX = 150;
const BASE_Y = 170;

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function claveDia(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Ventas de los últimos 7 días y productos más vendidos de hoy, calculados
 * con los pedidos que el panel ya tiene cargados (sin cancelados). No hace
 * peticiones extra: es la "foto rápida"; el detalle por fechas está abajo.
 */
export default function ResumenVentas({ pedidos }: { pedidos: Pedido[] }) {
  const { dias, top, hayDatos } = useMemo(() => {
    const hoy = new Date();
    const lista = Array.from({ length: DIAS }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - (DIAS - 1 - i));
      return {
        clave: claveDia(d),
        etiqueta: i === DIAS - 1 ? "Hoy" : d.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", ""),
        total: 0,
      };
    });
    const porClave = new Map(lista.map((d) => [d.clave, d]));
    const productos = new Map<string, number>();
    const claveHoy = claveDia(hoy);

    for (const p of pedidos) {
      if (p.estado === "cancelado") continue;
      const fecha = new Date(p.creadoEn);
      const dia = porClave.get(claveDia(fecha));
      if (dia) dia.total += p.total;
      if (claveDia(fecha) === claveHoy) {
        for (const item of p.items) productos.set(item.nombre, (productos.get(item.nombre) ?? 0) + item.cantidad);
      }
    }

    const masVendidos = Array.from(productos, ([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 4);

    return { dias: lista, top: masVendidos, hayDatos: lista.some((d) => d.total > 0) };
  }, [pedidos]);

  const maximo = Math.max(...dias.map((d) => d.total), 1);
  const indiceMax = dias.reduce((mejor, d, i) => (d.total > dias[mejor].total ? i : mejor), 0);
  const resumen = dias.map((d) => `${d.etiqueta} ${formatoMoneda(d.total)}`).join(", ");

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-3 rounded-[22px] border border-cream/10 bg-cocoa p-5 sm:p-6">
        <span className="text-[17px] font-bold">Últimos 7 días</span>
        {!hayDatos ? (
          <p className="py-10 text-center text-base text-cream/45">Todavía no hay ventas en los últimos 7 días.</p>
        ) : (
          <svg viewBox="0 0 560 200" width="100%" height="220" role="img" aria-label={`Ventas de los últimos 7 días: ${resumen}`}>
            <line x1="0" y1={BASE_Y} x2="560" y2={BASE_Y} stroke="rgba(245,241,230,0.12)" />
            <line x1="0" y1="95" x2="560" y2="95" stroke="rgba(245,241,230,0.06)" />
            {dias.map((d, i) => {
              const alto = d.total > 0 ? Math.max(6, Math.round((d.total / maximo) * ALTO_MAX)) : 0;
              const esHoy = i === DIAS - 1;
              const fill = esHoy ? "#D2232A" : i === indiceMax ? "#D9A441" : "#2D2C32";
              return (
                <g key={d.clave}>
                  <title>{`${d.etiqueta}: ${formatoMoneda(d.total)}`}</title>
                  <rect x={20 + i * 76} y={BASE_Y - alto} width="44" height={alto} rx="8" fill={fill} />
                  <text
                    x={42 + i * 76}
                    y="192"
                    textAnchor="middle"
                    fontSize="13"
                    fill={esHoy ? "#F5F1E6" : "#A9A59C"}
                    fontWeight={esHoy ? 700 : 400}
                  >
                    {d.etiqueta}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-4 rounded-[22px] border border-cream/10 bg-cocoa p-5 sm:p-6">
        <span className="text-[17px] font-bold">Más vendidos hoy</span>
        {top.length === 0 ? (
          <p className="py-6 text-base text-cream/45">Aún no hay ventas hoy.</p>
        ) : (
          top.map((p) => (
            <div key={p.nombre} className="flex flex-col gap-2">
              <div className="flex justify-between gap-2 text-base">
                <span className="font-medium">{p.nombre}</span>
                <span className="tabular-nums text-cream/65">{p.cantidad} uds</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-cream/10">
                <div className="h-2.5 rounded-full bg-ember" style={{ width: `${Math.round((p.cantidad / top[0].cantidad) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
