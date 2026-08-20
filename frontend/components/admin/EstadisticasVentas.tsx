"use client";

import { useState } from "react";
import { CalendarRange, DollarSign, ClipboardList, Loader2 } from "lucide-react";
import { obtenerEstadisticas } from "@/lib/api";
import { Estadisticas, TipoPedido } from "@/lib/types";

const MAX_DIAS_RANGO = 31;

const ETIQUETA_TIPO: Record<TipoPedido, string> = {
  mesa: "🍽️ Mesa",
  domicilio: "🛵 Domicilio",
  recoger: "🏠 Recoger",
};

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function fechaISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function diasEntre(desde: string, hasta: string) {
  const ms = new Date(`${hasta}T00:00:00`).getTime() - new Date(`${desde}T00:00:00`).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

const hoyISO = fechaISO(new Date());

export default function EstadisticasVentas() {
  const [desde, setDesde] = useState(hoyISO);
  const [hasta, setHasta] = useState(hoyISO);
  const [datos, setDatos] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const rangoInvalido = desde > hasta || diasEntre(desde, hasta) > MAX_DIAS_RANGO;

  async function consultar() {
    if (rangoInvalido) return;
    setCargando(true);
    setError("");
    try {
      setDatos(await obtenerEstadisticas(desde, hasta));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las estadísticas.");
      setDatos(null);
    } finally {
      setCargando(false);
    }
  }

  function aplicarPreset(dias: number) {
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (dias - 1));
    setDesde(fechaISO(inicio));
    setHasta(fechaISO(fin));
  }

  return (
    <section className="rounded-2xl border border-espresso/10 bg-white/60 p-5 dark:border-cream/10 dark:bg-cocoa/40">
      <div className="mb-4 flex items-center gap-2">
        <CalendarRange size={18} className="text-ember" />
        <h2 className="font-display text-lg font-semibold">Estadísticas de ventas</h2>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-espresso/60 dark:text-cream/60">
          Desde
          <input
            type="date"
            value={desde}
            max={hoyISO}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-espresso/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-ember dark:border-cream/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-espresso/60 dark:text-cream/60">
          Hasta
          <input
            type="date"
            value={hasta}
            max={hoyISO}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg border border-espresso/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-ember dark:border-cream/20"
          />
        </label>

        <div className="flex gap-1.5">
          <button onClick={() => aplicarPreset(1)} className="rounded-full border border-espresso/20 px-3 py-1.5 text-xs font-medium hover:border-ember hover:text-ember dark:border-cream/20">Hoy</button>
          <button onClick={() => aplicarPreset(7)} className="rounded-full border border-espresso/20 px-3 py-1.5 text-xs font-medium hover:border-ember hover:text-ember dark:border-cream/20">7 días</button>
          <button onClick={() => aplicarPreset(30)} className="rounded-full border border-espresso/20 px-3 py-1.5 text-xs font-medium hover:border-ember hover:text-ember dark:border-cream/20">30 días</button>
        </div>

        <button
          onClick={consultar}
          disabled={rangoInvalido || cargando}
          className="ml-auto flex items-center gap-2 rounded-full bg-ember px-5 py-2 text-sm font-semibold text-cream transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {cargando && <Loader2 size={14} className="animate-spin" />}
          Consultar
        </button>
      </div>

      {rangoInvalido && (
        <p className="mt-2 text-xs text-ember">
          {desde > hasta
            ? "La fecha 'desde' debe ser anterior o igual a 'hasta'."
            : `El rango no puede superar ${MAX_DIAS_RANGO} días.`}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-ember">{error}</p>}

      {datos && (
        <div className="mt-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-espresso/10 bg-white/60 p-3 dark:border-cream/10 dark:bg-cocoa/50">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-olive/20 text-olive">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-xs text-espresso/50 dark:text-cream/50">Ventas del rango</p>
                <p className="font-mono text-base font-semibold">{formatoMoneda(datos.totalVentas)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-espresso/10 bg-white/60 p-3 dark:border-cream/10 dark:bg-cocoa/50">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-ember/20 text-ember">
                <ClipboardList size={16} />
              </div>
              <div>
                <p className="text-xs text-espresso/50 dark:text-cream/50">Pedidos del rango</p>
                <p className="font-mono text-base font-semibold">{datos.totalPedidos}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso/50 dark:text-cream/50">
              Pedidos por categoría
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {datos.porTipo.map((grupo) => (
                <div key={grupo.tipoPedido} className="rounded-xl border border-espresso/10 bg-white/60 p-3 dark:border-cream/10 dark:bg-cocoa/50">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold">{ETIQUETA_TIPO[grupo.tipoPedido]}</span>
                    <span className="font-mono text-sm">{grupo.cantidad}</span>
                  </div>
                  <p className="mb-2 font-mono text-sm text-espresso/70 dark:text-cream/70">{formatoMoneda(grupo.total)}</p>
                  {grupo.pedidos.length > 0 ? (
                    <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
                      {grupo.pedidos.map((p) => (
                        <span
                          key={p.id}
                          title={`${p.cliente} — ${formatoMoneda(p.total)}`}
                          className="rounded-full bg-espresso/5 px-2 py-0.5 font-mono text-[11px] text-espresso/60 dark:bg-cream/10 dark:text-cream/60"
                        >
                          #{p.numero}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-espresso/40 dark:text-cream/40">Sin pedidos</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso/50 dark:text-cream/50">
              Productos vendidos
            </h3>
            {datos.productos.length === 0 ? (
              <p className="text-xs text-espresso/40 dark:text-cream/40">Sin ventas en este rango.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-espresso/10 dark:border-cream/10">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-espresso/5 text-xs uppercase tracking-wide text-espresso/50 dark:bg-cream/5 dark:text-cream/50">
                    <tr>
                      <th className="px-3 py-2 font-medium">Producto</th>
                      <th className="px-3 py-2 font-medium">Cantidad</th>
                      <th className="px-3 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.productos.map((p) => (
                      <tr key={p.nombre} className="border-t border-espresso/10 dark:border-cream/10">
                        <td className="px-3 py-2">{p.nombre}</td>
                        <td className="px-3 py-2 font-mono">{p.cantidad}</td>
                        <td className="px-3 py-2 font-mono">{formatoMoneda(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
