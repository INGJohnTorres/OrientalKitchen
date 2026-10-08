"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";
import { actualizarEstadoPedido, obtenerConfiguracion, obtenerPedidos } from "@/lib/api";
import { EstadoPedido, Pedido } from "@/lib/types";
import { emojiParaProducto } from "@/lib/whatsapp";
import { etiquetaTipoPedido } from "@/lib/pedido-utils";
import { permitePedidos } from "@/lib/plan";
import AdminShell from "@/components/admin/AdminShell";

const columnas: { estado: EstadoPedido; titulo: string; texto: string; borde: string }[] = [
  { estado: "nuevo", titulo: "Nuevos", texto: "text-ember-claro", borde: "border-ember" },
  { estado: "preparando", titulo: "Preparando", texto: "text-mustard-claro", borde: "border-mustard" },
  { estado: "listo", titulo: "Listos para servir", texto: "text-olive-claro", borde: "border-olive" },
];

const accion: Record<string, { texto: string; siguiente: EstadoPedido; clase: string }> = {
  nuevo: { texto: "Empezar a preparar", siguiente: "preparando", clase: "bg-ember text-white" },
  preparando: { texto: "Marcar como listo", siguiente: "listo", clase: "bg-mustard text-espresso" },
  listo: { texto: "Entregado", siguiente: "entregado", clase: "bg-olive text-white" },
};

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

function textoMinutos(min: number) {
  if (min < 60) return `${min} min`;
  const m = min % 60;
  return m === 0 ? `${Math.floor(min / 60)} h` : `${Math.floor(min / 60)} h ${m} min`;
}

export default function VistaCocina() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  // Hora actual: se fija después de montar para no desfasar el HTML del servidor.
  const [ahora, setAhora] = useState<number | null>(null);
  const cantidadPrevia = useRef<number | null>(null);
  // Ref para que el intervalo (creado una sola vez) vea el valor vigente del interruptor.
  const sonidoRef = useRef(true);

  useEffect(() => {
    sonidoRef.current = sonidoActivo;
  }, [sonidoActivo]);

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    obtenerConfiguracion().then((c) => {
      if (!permitePedidos(c.plan)) router.push("/admin/dashboard");
    });
    cargar();
    setAhora(Date.now());
    const intervalo = setInterval(cargar, 4000);
    const reloj = setInterval(() => setAhora(Date.now()), 20000);
    return () => {
      clearInterval(intervalo);
      clearInterval(reloj);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    const data = await obtenerPedidos();
    const nuevos = data.filter((p) => p.estado === "nuevo").length;
    if (cantidadPrevia.current !== null && nuevos > cantidadPrevia.current && sonidoRef.current) {
      reproducirBeep();
    }
    cantidadPrevia.current = nuevos;
    setPedidos(data);
  }

  async function avanzar(id: string, siguiente: EstadoPedido) {
    await actualizarEstadoPedido(id, siguiente);
    cargar();
  }

  const acciones = (
    <button
      onClick={() => setSonidoActivo((s) => !s)}
      aria-pressed={sonidoActivo}
      className={clsx(
        "flex h-[52px] items-center gap-2.5 rounded-2xl border px-5 text-[15px] font-semibold transition active:scale-[0.98]",
        sonidoActivo ? "border-olive/50 bg-olive/15 text-olive-claro" : "border-cream/15 bg-tarjeta text-cream/65"
      )}
    >
      {sonidoActivo ? <Volume2 size={20} /> : <VolumeX size={20} />}
      {sonidoActivo ? "Sonido activado" : "Sonido silenciado"}
    </button>
  );

  return (
    <AdminShell
      activo="cocina"
      titulo="Vista de cocina"
      subtitulo="Solo lo que hay que preparar, en grande."
      acciones={acciones}
    >
      <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-[18px]">
        {columnas.map((col) => {
          const lista = pedidos.filter((p) => p.estado === col.estado);
          const a = accion[col.estado];
          return (
            <div key={col.estado} className="flex flex-col gap-3.5 rounded-[26px] border border-cream/[0.07] bg-panel p-4">
              <div className="flex items-center justify-between px-1.5">
                <h2 className={clsx("font-display text-[19px] uppercase", col.texto)}>{col.titulo}</h2>
                <span className="grid h-10 min-w-[40px] place-items-center rounded-full bg-cream/10 px-2 text-lg font-bold">
                  {lista.length}
                </span>
              </div>

              {lista.map((p) => {
                const min = ahora === null ? 0 : Math.max(0, Math.floor((ahora - new Date(p.creadoEn).getTime()) / 60000));
                const urgente = min >= 10 && col.estado !== "listo";
                return (
                  <article key={p.id} className={clsx("rounded-[22px] border-l-[6px] bg-tarjeta p-5", col.borde)}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="font-display text-[32px] leading-none">#{p.numero}</span>
                      <span
                        className={clsx(
                          "rounded-full px-3.5 py-1.5 text-[15px] font-bold tabular-nums",
                          urgente ? "bg-ember text-white" : "bg-cream/10 text-cream/80"
                        )}
                      >
                        {ahora === null ? "—" : textoMinutos(min)}
                      </span>
                    </div>
                    <p className="text-[17px] font-semibold text-mustard-claro">{etiquetaTipoPedido(p)}</p>
                    <p className="mb-3 text-[15px] text-cream/60">{p.cliente}</p>
                    <ul className="mb-3 space-y-1.5 text-xl leading-snug">
                      {p.items.map((i) => (
                        <li key={i.claveUnica}>
                          <span className="font-bold text-mustard-claro">{i.cantidad}×</span> {emojiParaProducto(i.nombre)}{" "}
                          {i.nombre}
                        </li>
                      ))}
                    </ul>
                    {p.observaciones && (
                      <p className="mb-3 rounded-xl bg-ember/15 px-3.5 py-2.5 text-base italic text-ember-claro">
                        “{p.observaciones}”
                      </p>
                    )}
                    <button
                      onClick={() => avanzar(p.id, a.siguiente)}
                      className={clsx("h-16 w-full rounded-2xl text-lg font-bold transition active:scale-[0.98]", a.clase)}
                    >
                      {a.texto}
                    </button>
                  </article>
                );
              })}

              {lista.length === 0 && (
                <p className="rounded-[20px] border-2 border-dashed border-cream/15 p-6 text-center text-base text-cream/40">
                  Sin pedidos
                </p>
              )}
            </div>
          );
        })}
      </section>
    </AdminShell>
  );
}
