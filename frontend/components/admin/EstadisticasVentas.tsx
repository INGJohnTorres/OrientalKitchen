"use client";

import { useState } from "react";
import { CalendarRange, DollarSign, ClipboardList, Loader2, X, Check } from "lucide-react";
import clsx from "clsx";
import { obtenerEstadisticas, eliminarPedido } from "@/lib/api";
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

/** Fecha local (no UTC) en formato YYYY-MM-DD: "hoy" debe ser el día de quien mira el panel. */
function fechaISO(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diasEntre(desde: string, hasta: string) {
  const ms = new Date(`${hasta}T00:00:00`).getTime() - new Date(`${desde}T00:00:00`).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

const campoFecha =
  "h-12 rounded-xl border border-cream/20 bg-transparent px-3.5 text-base outline-none focus:border-ember [color-scheme:dark]";

export default function EstadisticasVentas() {
  // El día de hoy se calcula al usar el componente (no al cargar el módulo),
  // para que no quede fijo si el panel se deja abierto de un día para otro.
  const [desde, setDesde] = useState(() => fechaISO(new Date()));
  const [hasta, setHasta] = useState(() => fechaISO(new Date()));
  const [datos, setDatos] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  const hoyISO = fechaISO(new Date());
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

  async function borrarPedido(id: string) {
    setBorrandoId(id);
    try {
      await eliminarPedido(id);
      await consultar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el pedido.");
    } finally {
      setBorrandoId(null);
      setConfirmandoId(null);
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
    <section className="rounded-[22px] border border-cream/10 bg-cocoa p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <CalendarRange size={20} className="text-ember-claro" />
        <h3 className="text-[17px] font-bold">Consultar por fechas</h3>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          Desde
          <input type="date" value={desde} max={hoyISO} onChange={(e) => setDesde(e.target.value)} className={campoFecha} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-cream/65">
          Hasta
          <input type="date" value={hasta} max={hoyISO} onChange={(e) => setHasta(e.target.value)} className={campoFecha} />
        </label>

        <div className="flex gap-2">
          {[
            { dias: 1, texto: "Hoy" },
            { dias: 7, texto: "7 días" },
            { dias: 30, texto: "30 días" },
          ].map((p) => (
            <button
              key={p.dias}
              onClick={() => aplicarPreset(p.dias)}
              className="h-12 rounded-full border border-cream/20 px-5 text-[15px] font-medium text-cream/85 transition hover:border-ember active:scale-95"
            >
              {p.texto}
            </button>
          ))}
        </div>

        <button
          onClick={consultar}
          disabled={rangoInvalido || cargando}
          className="ml-auto flex h-12 items-center gap-2 rounded-2xl bg-ember px-7 text-base font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {cargando && <Loader2 size={16} className="animate-spin" />}
          Consultar
        </button>
      </div>

      {rangoInvalido && (
        <p className="mt-3 text-sm text-ember-claro">
          {desde > hasta
            ? "La fecha 'desde' debe ser anterior o igual a 'hasta'."
            : `El rango no puede superar ${MAX_DIAS_RANGO} días.`}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-ember-claro">{error}</p>}

      {datos && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-cream/10 bg-tarjeta p-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-olive/25 text-olive-claro">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm text-cream/60">Ventas del rango</p>
                <p className="font-display text-2xl tabular-nums">{formatoMoneda(datos.totalVentas)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-cream/10 bg-tarjeta p-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-ember/25 text-ember-claro">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-sm text-cream/60">Pedidos del rango</p>
                <p className="font-display text-2xl tabular-nums">{datos.totalPedidos}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream/55">Pedidos por categoría</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {datos.porTipo.map((grupo) => (
                <div key={grupo.tipoPedido} className="rounded-2xl border border-cream/10 bg-tarjeta p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-base font-semibold">{ETIQUETA_TIPO[grupo.tipoPedido]}</span>
                    <span className="font-display text-lg">{grupo.cantidad}</span>
                  </div>
                  <p className="mb-3 text-[15px] tabular-nums text-cream/70">{formatoMoneda(grupo.total)}</p>
                  {grupo.pedidos.length > 0 ? (
                    <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                      {grupo.pedidos.map((p) => (
                        <span
                          key={p.id}
                          title={`${p.cliente} — ${formatoMoneda(p.total)}`}
                          className="flex h-10 items-center gap-1 rounded-full bg-cream/10 pl-3 pr-1 text-sm font-semibold tabular-nums text-cream/80"
                        >
                          #{p.numero}
                          {confirmandoId === p.id ? (
                            <>
                              <span className="px-1 text-ember-claro">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={() => borrarPedido(p.id)}
                                disabled={borrandoId === p.id}
                                aria-label={`Confirmar borrar pedido #${p.numero}`}
                                className="relative grid h-8 w-8 place-items-center after:absolute after:-inset-1.5 after:content-[''] rounded-full bg-ember text-white disabled:opacity-40"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmandoId(null)}
                                aria-label="Cancelar"
                                className="relative grid h-8 w-8 place-items-center after:absolute after:-inset-1.5 after:content-[''] rounded-full text-cream/65 hover:bg-cream/10"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmandoId(p.id)}
                              aria-label={`Borrar pedido #${p.numero}`}
                              className={clsx(
                                "relative grid h-8 w-8 place-items-center rounded-full text-cream/50 after:absolute after:-inset-1.5 after:content-['']",
                                "hover:bg-ember/25 hover:text-ember-claro"
                              )}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-cream/40">Sin pedidos</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream/55">Productos vendidos</h4>
            {datos.productos.length === 0 ? (
              <p className="text-sm text-cream/40">Sin ventas en este rango.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-cream/10">
                <table className="w-full text-left text-[15px] sm:text-base">
                  <thead className="bg-cream/5 text-xs uppercase sm:text-sm tracking-wide text-cream/55">
                    <tr>
                      <th className="px-3 py-3 sm:px-4 font-medium">Producto</th>
                      <th className="px-3 py-3 sm:px-4 font-medium">Cantidad</th>
                      <th className="px-3 py-3 sm:px-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.productos.map((p) => (
                      <tr key={p.nombre} className="border-t border-cream/10">
                        <td className="px-3 py-3.5 sm:px-4">{p.nombre}</td>
                        <td className="px-3 py-3.5 sm:px-4 tabular-nums">{p.cantidad}</td>
                        <td className="px-3 py-3.5 sm:px-4 tabular-nums">{formatoMoneda(p.total)}</td>
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
