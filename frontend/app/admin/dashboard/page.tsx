"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChefHat, Lock, RefreshCw, Trash2 } from "lucide-react";
import clsx from "clsx";
import {
  actualizarEstadoPedido,
  eliminarTodosPedidos,
  obtenerConfiguracion,
  obtenerPedidos,
} from "@/lib/api";
import { EstadoPedido, Pedido, PlanNegocio } from "@/lib/types";
import { permiteEstadisticas, permitePedidos } from "@/lib/plan";
import AdminShell from "@/components/admin/AdminShell";
import EstadisticasVentas from "@/components/admin/EstadisticasVentas";
import ResumenVentas from "@/components/admin/ResumenVentas";
import TarjetaPedido from "@/components/admin/TarjetaPedido";

// "entregado" se oculta del tablero a propósito: una vez un pedido se
// entrega, deja de ser accionable aquí — su historial vive en las
// estadísticas de ventas (sección de abajo), no en este tablero en vivo.
const columnas: { estado: EstadoPedido; titulo: string; color: string }[] = [
  { estado: "nuevo", titulo: "Nuevos", color: "text-ember-claro" },
  { estado: "preparando", titulo: "En preparación", color: "text-mustard-claro" },
  { estado: "listo", titulo: "Listos", color: "text-olive-claro" },
];

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function mayuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosNuevos, setPedidosNuevos] = useState(0);
  const cantidadPrevia = useRef<number | null>(null);
  const [plan, setPlan] = useState<PlanNegocio | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [mostrarBorrarTodo, setMostrarBorrarTodo] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const [borrandoTodo, setBorrandoTodo] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState("");
  // Hora actual: se fija después de montar para no desfasar el HTML del servidor.
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    obtenerConfiguracion().then((c) => setPlan(c.plan));
    cargar();
    // Simula "tiempo real": refresca cada 4s buscando pedidos nuevos.
    const intervalo = setInterval(cargar, 4000);
    setAhora(Date.now());
    const reloj = setInterval(() => setAhora(Date.now()), 20000);
    return () => {
      clearInterval(intervalo);
      clearInterval(reloj);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    const data = await obtenerPedidos();
    // La primera carga trae lo que ya existía: no son notificaciones nuevas.
    const primeraCarga = cantidadPrevia.current === null;
    if (!primeraCarga && data.length > cantidadPrevia.current!) {
      setPedidosNuevos((n) => n + (data.length - cantidadPrevia.current!));
    }
    cantidadPrevia.current = data.length;
    setPedidos(data);
  }

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    await actualizarEstadoPedido(id, estado);
    cargar();
  }

  async function refrescar() {
    setRefrescando(true);
    await cargar();
    setAhora(Date.now());
    setRefrescando(false);
  }

  async function borrarTodoElHistorial() {
    if (textoConfirmacion.trim().toUpperCase() !== "BORRAR") return;
    setBorrandoTodo(true);
    setErrorBorrado("");
    try {
      await eliminarTodosPedidos();
      setPedidos([]);
      cantidadPrevia.current = 0;
      setMostrarBorrarTodo(false);
      setTextoConfirmacion("");
    } catch (err) {
      setErrorBorrado(err instanceof Error ? err.message : "No se pudo borrar el historial.");
    } finally {
      setBorrandoTodo(false);
    }
  }

  const hoy = new Date().toDateString();
  const ventasHoy = pedidos
    .filter((p) => new Date(p.creadoEn).toDateString() === hoy && p.estado !== "cancelado")
    .reduce((acc, p) => acc + p.total, 0);
  const cuenta = (estado: EstadoPedido) => pedidos.filter((p) => p.estado === estado).length;

  const puedePedir = plan === null || permitePedidos(plan);
  const puedeVerEstadisticas = plan === null || permiteEstadisticas(plan);

  const contadores = [
    { label: "Nuevos", valor: String(cuenta("nuevo")) },
    { label: "En preparación", valor: String(cuenta("preparando")) },
    { label: "Listos para entregar", valor: String(cuenta("listo")) },
    { label: "Ventas de hoy", valor: formatoMoneda(ventasHoy), destacado: true },
  ];

  const subtitulo = (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="flex items-center gap-1.5 font-semibold text-olive-claro">
        <span className="h-2.5 w-2.5 rounded-full bg-olive-claro" /> En vivo
      </span>
      {ahora !== null && (
        <span>{mayuscula(new Date(ahora).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }))}</span>
      )}
    </span>
  );

  const acciones = (
    <>
      {ahora !== null && (
        <span className="pr-1 font-display text-[22px] tabular-nums">
          {new Date(ahora).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}
        </span>
      )}
      <button
        onClick={refrescar}
        aria-label="Actualizar pedidos"
        className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-cream/15 bg-tarjeta transition active:scale-95"
      >
        <RefreshCw size={22} className={refrescando ? "animate-spin" : ""} />
      </button>
      <button
        onClick={() => setPedidosNuevos(0)}
        aria-label={`Notificaciones, ${pedidosNuevos} nuevas`}
        className="relative grid h-[52px] w-[52px] place-items-center rounded-2xl border border-cream/15 bg-tarjeta transition active:scale-95"
      >
        <Bell size={22} />
        {pedidosNuevos > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-ember px-1 text-xs font-bold text-white">
            {pedidosNuevos}
          </span>
        )}
      </button>
      {puedePedir && (
        <Link
          href="/admin/cocina"
          className="flex h-[52px] items-center gap-2.5 rounded-2xl bg-mustard px-6 text-base font-bold text-espresso transition active:scale-[0.98]"
        >
          <ChefHat size={21} /> Vista de cocina
        </Link>
      )}
    </>
  );

  return (
    <AdminShell activo="pedidos" titulo="Pedidos en vivo" subtitulo={subtitulo} acciones={acciones}>
      {/* En el celular van 2×2 para que los pedidos queden a la vista sin tanto scroll. */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:gap-3.5">
        {contadores.map((c) => (
          <div key={c.label} className="flex flex-col gap-1 rounded-[20px] border border-cream/10 bg-cocoa px-4 py-3.5 sm:px-[22px] sm:py-[18px]">
            <span className="text-sm font-medium leading-snug text-cream/65 sm:text-[15px]">{c.label}</span>
            <span
              className={clsx(
                "whitespace-nowrap font-display leading-tight tabular-nums",
                // Cifras de millones (ej. $ 3.399.600) no caben a 30 px en la tarjeta.
                c.valor.length > 10
                  ? "text-[17px] sm:text-[20px]"
                  : c.valor.length > 8
                    ? "text-[19px] sm:text-[24px]"
                    : "text-[24px] sm:text-[30px]",
                c.destacado && "text-mustard-claro"
              )}
            >
              {c.valor}
            </span>
          </div>
        ))}
      </section>

      {!puedePedir ? (
        <div className="flex items-center gap-3 rounded-[22px] border-2 border-dashed border-cream/15 bg-cocoa/60 p-6 text-base text-cream/60">
          <Lock size={22} />
          Los pedidos en línea están disponibles desde el plan Medio.
        </div>
      ) : (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[18px]">
          {columnas.map((col) => {
            const lista = pedidos.filter((p) => p.estado === col.estado);
            return (
              <div key={col.estado} className="flex flex-col gap-3.5 rounded-[26px] border border-cream/[0.07] bg-panel p-4">
                <div className="flex items-center justify-between px-1.5">
                  <h2 className={clsx("font-display text-[17px] uppercase", col.color)}>{col.titulo}</h2>
                  <span className="grid h-9 min-w-[36px] place-items-center rounded-full bg-cream/10 px-1.5 text-base font-bold">
                    {lista.length}
                  </span>
                </div>
                {lista.map((p) => (
                  <TarjetaPedido
                    key={p.id}
                    pedido={p}
                    minutos={ahora === null ? 0 : Math.max(0, Math.floor((ahora - new Date(p.creadoEn).getTime()) / 60000))}
                    onCambiarEstado={cambiarEstado}
                  />
                ))}
                {lista.length === 0 && (
                  <p className="rounded-[20px] border-2 border-dashed border-cream/15 p-6 text-center text-base text-cream/40">
                    Sin pedidos
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      <section id="estadisticas" className="flex scroll-mt-6 flex-col gap-4">
        {puedeVerEstadisticas ? (
          <>
            <h2 className="text-xl font-bold">Ventas y productos</h2>
            <ResumenVentas pedidos={pedidos} />
            <EstadisticasVentas />
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-[22px] border-2 border-dashed border-cream/15 bg-cocoa/60 p-6 text-base text-cream/60">
            <Lock size={22} />
            El dashboard de estadísticas de ventas está disponible en el plan Premium.
          </div>
        )}
      </section>

      <section>
        {!mostrarBorrarTodo ? (
          <button
            onClick={() => setMostrarBorrarTodo(true)}
            className="flex min-h-[48px] items-center gap-2 text-sm text-cream/45 hover:text-ember-claro"
          >
            <Trash2 size={16} /> Borrar todo el historial de pedidos
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-[22px] border-2 border-dashed border-ember/45 bg-ember/10 p-5">
            <p className="text-base text-ember-claro">
              Esto borra <strong>todos</strong> los pedidos (activos e historial de ventas) de forma permanente. Escribe{" "}
              <strong>BORRAR</strong> para confirmar.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={textoConfirmacion}
                onChange={(e) => setTextoConfirmacion(e.target.value)}
                placeholder="BORRAR"
                className="h-12 rounded-xl border border-ember/40 bg-transparent px-4 text-base outline-none focus:border-ember"
              />
              <button
                onClick={borrarTodoElHistorial}
                disabled={textoConfirmacion.trim().toUpperCase() !== "BORRAR" || borrandoTodo}
                className="h-12 rounded-xl bg-ember px-6 text-base font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmar borrado
              </button>
              <button
                onClick={() => {
                  setMostrarBorrarTodo(false);
                  setTextoConfirmacion("");
                  setErrorBorrado("");
                }}
                className="h-12 rounded-xl border-2 border-cream/20 px-5 text-base font-medium text-cream/75"
              >
                Cancelar
              </button>
            </div>
            {errorBorrado && <p className="text-sm text-ember-claro">{errorBorrado}</p>}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
