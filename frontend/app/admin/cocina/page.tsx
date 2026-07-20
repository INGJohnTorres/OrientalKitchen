"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Volume2, VolumeX } from "lucide-react";
import { actualizarEstadoPedido, obtenerPedidos } from "@/lib/api";
import { EstadoPedido, Pedido } from "@/lib/types";

const columnas: { estado: EstadoPedido; titulo: string; color: string }[] = [
  { estado: "nuevo", titulo: "🆕 Nuevos", color: "border-ember" },
  { estado: "preparando", titulo: "🔥 Preparando", color: "border-mustard" },
  { estado: "listo", titulo: "✅ Listos para servir", color: "border-olive" },
];

/** Pitido corto sin necesidad de un archivo de audio externo. */
function reproducirBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Web Audio no disponible; se ignora silenciosamente.
  }
}

export default function VistaCocina() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const cantidadPrevia = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    cargar();
    const intervalo = setInterval(cargar, 4000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    const data = await obtenerPedidos();
    const nuevos = data.filter((p) => p.estado === "nuevo").length;
    if (cantidadPrevia.current !== null && nuevos > cantidadPrevia.current && sonidoActivo) {
      reproducirBeep();
    }
    cantidadPrevia.current = nuevos;
    setPedidos(data);
  }

  async function avanzar(id: string, siguiente: EstadoPedido) {
    await actualizarEstadoPedido(id, siguiente);
    cargar();
  }

  return (
    <main className="min-h-screen bg-espresso p-6 text-cream">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="text-ember" />
          <h1 className="font-display text-2xl">Vista de Cocina — Oriental Kitchen</h1>
        </div>
        <button
          onClick={() => setSonidoActivo((s) => !s)}
          className="flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-sm"
        >
          {sonidoActivo ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {sonidoActivo ? "Sonido activado" : "Sonido silenciado"}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {columnas.map((col) => {
          const pedidosCol = pedidos.filter((p) => p.estado === col.estado);
          return (
            <div key={col.estado} className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold">
                {col.titulo} ({pedidosCol.length})
              </h2>
              <div className="flex flex-col gap-4">
                {pedidosCol.map((p) => (
                  <div key={p.id} className={`rounded-2xl border-l-4 ${col.color} bg-cocoa/70 p-5 shadow-lg`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-2xl font-bold">Mesa {p.mesa}</span>
                      <span className="text-sm text-cream/50">
                        {new Date(p.creadoEn).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-cream/60">{p.cliente}</p>
                    <ul className="mb-3 space-y-1 text-lg">
                      {p.items.map((i) => (
                        <li key={i.claveUnica}>
                          <span className="font-bold text-mustard">{i.cantidad}×</span> {i.nombre}
                        </li>
                      ))}
                    </ul>
                    {p.observaciones && (
                      <p className="mb-3 rounded-lg bg-ember/10 px-3 py-2 text-sm italic text-ember">
                        "{p.observaciones}"
                      </p>
                    )}
                    {col.estado === "nuevo" && (
                      <button onClick={() => avanzar(p.id, "preparando")} className="w-full rounded-full bg-ember py-2 font-semibold">
                        Empezar a preparar
                      </button>
                    )}
                    {col.estado === "preparando" && (
                      <button onClick={() => avanzar(p.id, "listo")} className="w-full rounded-full bg-mustard py-2 font-semibold text-espresso">
                        Marcar como listo
                      </button>
                    )}
                    {col.estado === "listo" && (
                      <button onClick={() => avanzar(p.id, "entregado")} className="w-full rounded-full bg-olive py-2 font-semibold">
                        Entregado a la mesa
                      </button>
                    )}
                  </div>
                ))}
                {pedidosCol.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-cream/15 p-6 text-center text-cream/30">
                    Sin pedidos
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
