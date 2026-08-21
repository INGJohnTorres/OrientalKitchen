"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, DollarSign, ClipboardList, ChefHat, Package, Settings, Lock, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import {
  actualizarEstadoPedido,
  cerrarSesion as cerrarSesionApi,
  obtenerPedidos,
  obtenerConfiguracion,
  rolActual,
  eliminarTodosPedidos,
} from "@/lib/api";
import { emojiParaProducto } from "@/lib/whatsapp";
import { EstadoPedido, Pedido, PlanNegocio } from "@/lib/types";
import { etiquetaTipoPedido } from "@/lib/pedido-utils";
import { permitePedidos, permiteEstadisticas, permiteEditorProductos } from "@/lib/plan";
import EstadisticasVentas from "@/components/admin/EstadisticasVentas";
import clsx from "clsx";

// "entregado" se oculta del tablero a propósito: una vez un pedido se
// entrega, deja de ser accionable aquí — su historial vive en las
// estadísticas de ventas (sección de abajo), no en este tablero en vivo.
const columnas: { estado: EstadoPedido; titulo: string }[] = [
  { estado: "nuevo", titulo: "Nuevos" },
  { estado: "preparando", titulo: "En preparación" },
  { estado: "listo", titulo: "Listos" },
];

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosNuevos, setPedidosNuevos] = useState(0);
  const [plan, setPlan] = useState<PlanNegocio | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [mostrarBorrarTodo, setMostrarBorrarTodo] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const [borrandoTodo, setBorrandoTodo] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState("");
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    setEsSuperAdmin(rolActual() === "superadmin");
    obtenerConfiguracion().then((c) => setPlan(c.plan));
    cargar();
    // Simula "tiempo real": refresca cada 4s buscando nuevos pedidos en localStorage.
    // TODO: conectar backend — reemplazar por un socket (ver src/lib/socket.ts del backend).
    const intervalo = setInterval(cargar, 4000);
    return () => clearInterval(intervalo);
  }, []);

  async function cargar() {
    const data = await obtenerPedidos();
    setPedidos((prev) => {
      if (data.length > prev.length) {
        setPedidosNuevos((n) => n + (data.length - prev.length));
      }
      return data;
    });
  }

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    await actualizarEstadoPedido(id, estado);
    cargar();
  }

  async function refrescar() {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  }

  async function borrarTodoElHistorial() {
    if (textoConfirmacion.trim().toUpperCase() !== "BORRAR") return;
    setBorrandoTodo(true);
    setErrorBorrado("");
    try {
      await eliminarTodosPedidos();
      setPedidos([]);
      setMostrarBorrarTodo(false);
      setTextoConfirmacion("");
    } catch (err) {
      setErrorBorrado(err instanceof Error ? err.message : "No se pudo borrar el historial.");
    } finally {
      setBorrandoTodo(false);
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem("admin-autenticado");
    cerrarSesionApi();
    router.push("/admin");
  }

  const hoy = new Date().toDateString();
  const ventasHoy = pedidos
    .filter((p) => new Date(p.creadoEn).toDateString() === hoy && p.estado !== "cancelado")
    .reduce((acc, p) => acc + p.total, 0);
  const ventasTotales = pedidos
    .filter((p) => p.estado !== "cancelado")
    .reduce((acc, p) => acc + p.total, 0);
  const pedidosActivos = pedidos.filter((p) =>
    ["nuevo", "preparando", "listo"].includes(p.estado)
  ).length;

  const puedePedir = plan === null || permitePedidos(plan);
  const puedeVerEstadisticas = plan === null || permiteEstadisticas(plan);
  const puedeEditarProductos = plan === null || permiteEditorProductos(plan);

  return (
    <main className="min-h-screen bg-parchment dark:bg-espresso dark:text-cream">
      <header className="flex items-center justify-between border-b border-espresso/10 bg-white/60 px-6 py-4 dark:border-cream/10 dark:bg-cocoa/40">
        <h1 className="font-display text-xl font-semibold">Panel — Oriental Kitchen</h1>
        <div className="flex items-center gap-4">
          {puedeEditarProductos && (
            <Link
              href="/admin/productos"
              className="flex items-center gap-1.5 rounded-full border border-espresso/20 px-4 py-2 text-sm font-medium transition hover:border-ember hover:text-ember dark:border-cream/20"
            >
              <Package size={16} /> Editar productos
            </Link>
          )}
          <Link
            href="/admin/configuracion"
            className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 transition hover:border-ember hover:text-ember dark:border-cream/20"
            aria-label="Configuración"
          >
            <Settings size={16} />
          </Link>
          {esSuperAdmin && (
            <Link
              href="/admin/superadmin"
              className="grid h-9 w-9 place-items-center rounded-full border border-espresso/20 transition hover:border-ember hover:text-ember dark:border-cream/20"
              aria-label="Panel de superadministrador"
            >
              <ShieldCheck size={16} />
            </Link>
          )}
          {puedePedir && (
            <Link
              href="/admin/cocina"
              className="flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-sm font-medium text-cream transition hover:bg-ember-dark"
            >
              <ChefHat size={16} /> Vista de cocina
            </Link>
          )}
          <button
            onClick={() => setPedidosNuevos(0)}
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10"
          >
            <Bell size={18} />
            {pedidosNuevos > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-ember text-[10px] font-bold text-cream">
                {pedidosNuevos}
              </span>
            )}
          </button>
          <button onClick={cerrarSesion} className="flex items-center gap-1.5 text-sm text-espresso/60 hover:text-ember dark:text-cream/60">
            <LogOut size={15} /> Salir
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-espresso/10 bg-white/60 p-4 dark:border-cream/10 dark:bg-cocoa/40">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-olive/20 text-olive">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-xs text-espresso/50 dark:text-cream/50">Ventas de hoy</p>
            <p className="font-mono text-lg font-semibold">{formatoMoneda(ventasHoy)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-espresso/10 bg-white/60 p-4 dark:border-cream/10 dark:bg-cocoa/40">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-mustard/20 text-ember-dark">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-xs text-espresso/50 dark:text-cream/50">Ventas totales</p>
            <p className="font-mono text-lg font-semibold">{formatoMoneda(ventasTotales)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-espresso/10 bg-white/60 p-4 dark:border-cream/10 dark:bg-cocoa/40">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-ember/20 text-ember">
            <ClipboardList size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-espresso/50 dark:text-cream/50">Pedidos activos</p>
            <p className="font-mono text-lg font-semibold">{pedidosActivos}</p>
          </div>
          <button
            onClick={refrescar}
            aria-label="Refrescar pedidos"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-espresso/50 transition hover:bg-espresso/10 dark:text-cream/50 dark:hover:bg-cream/10"
          >
            <RefreshCw size={15} className={refrescando ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-4">
        {!mostrarBorrarTodo ? (
          <button
            onClick={() => setMostrarBorrarTodo(true)}
            className="flex items-center gap-1.5 text-xs text-espresso/40 hover:text-ember dark:text-cream/40"
          >
            <Trash2 size={13} /> Borrar todo el historial de pedidos
          </button>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-ember/40 bg-ember/5 p-4 text-sm">
            <p className="text-ember">
              Esto borra <strong>todos</strong> los pedidos (activos e historial de ventas) de forma
              permanente. Escribe <strong>BORRAR</strong> para confirmar.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={textoConfirmacion}
                onChange={(e) => setTextoConfirmacion(e.target.value)}
                placeholder="BORRAR"
                className="rounded-lg border border-ember/30 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-ember"
              />
              <button
                onClick={borrarTodoElHistorial}
                disabled={textoConfirmacion.trim().toUpperCase() !== "BORRAR" || borrandoTodo}
                className="rounded-full bg-ember px-4 py-1.5 text-xs font-semibold text-cream transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmar borrado
              </button>
              <button
                onClick={() => {
                  setMostrarBorrarTodo(false);
                  setTextoConfirmacion("");
                  setErrorBorrado("");
                }}
                className="rounded-full border border-espresso/20 px-4 py-1.5 text-xs font-medium text-espresso/60 dark:border-cream/20 dark:text-cream/60"
              >
                Cancelar
              </button>
            </div>
            {errorBorrado && <p className="text-xs text-ember">{errorBorrado}</p>}
          </div>
        )}
      </div>

      <div className="px-6 pb-8">
        {puedeVerEstadisticas ? (
          <EstadisticasVentas />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-espresso/15 bg-white/40 p-5 text-sm text-espresso/50 dark:border-cream/15 dark:bg-cocoa/30 dark:text-cream/50">
            <Lock size={18} />
            El dashboard de estadísticas de ventas está disponible en el plan Premium.
          </div>
        )}
      </div>

      {!puedePedir ? (
        <div className="mx-6 mb-8 flex items-center gap-3 rounded-2xl border border-dashed border-espresso/15 bg-white/40 p-5 text-sm text-espresso/50 dark:border-cream/15 dark:bg-cocoa/30 dark:text-cream/50">
          <Lock size={18} />
          Los pedidos en línea están disponibles desde el plan Medio.
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 px-6 pb-8 lg:grid-cols-3">
        {columnas.map((col) => (
          <div key={col.estado} className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-espresso/60 dark:text-cream/60">
              {col.titulo} ({pedidos.filter((p) => p.estado === col.estado).length})
            </h2>
            <div className="flex flex-col gap-3">
              {pedidos
                .filter((p) => p.estado === col.estado)
                .map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-espresso/10 bg-white/70 p-4 text-sm shadow-sm dark:border-cream/10 dark:bg-cocoa/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono font-semibold">#{p.numero}</span>
                      <span className="text-xs text-espresso/50 dark:text-cream/50">
                        {new Date(p.creadoEn).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p>{etiquetaTipoPedido(p)} — {p.cliente}</p>
                    <ul className="my-2 list-disc pl-4 text-espresso/70 dark:text-cream/70">
                      {p.items.map((i) => (
                        <li key={i.claveUnica}>{emojiParaProducto(i.nombre)} {i.cantidad} {i.nombre}</li>
                      ))}
                    </ul>
                    {p.observaciones && (
                      <p className="mb-2 text-xs italic text-espresso/50 dark:text-cream/50">"{p.observaciones}"</p>
                    )}
                    <p className="mb-3 font-mono font-semibold">{formatoMoneda(p.total)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {col.estado === "nuevo" && (
                        <button onClick={() => cambiarEstado(p.id, "preparando")} className="rounded-full bg-ember px-3 py-1 text-xs font-medium text-cream">Aceptar</button>
                      )}
                      {col.estado === "preparando" && (
                        <button onClick={() => cambiarEstado(p.id, "listo")} className="rounded-full bg-mustard px-3 py-1 text-xs font-medium text-espresso">Marcar listo</button>
                      )}
                      {col.estado === "listo" && (
                        <button onClick={() => cambiarEstado(p.id, "entregado")} className="rounded-full bg-olive px-3 py-1 text-xs font-medium text-cream">Entregado</button>
                      )}
                      {col.estado !== "entregado" && (
                        <button onClick={() => cambiarEstado(p.id, "cancelado")} className="rounded-full border border-espresso/20 px-3 py-1 text-xs font-medium text-espresso/60 dark:border-cream/20 dark:text-cream/60">Cancelar</button>
                      )}
                    </div>
                  </div>
                ))}
              {pedidos.filter((p) => p.estado === col.estado).length === 0 && (
                <p className={clsx("rounded-xl border border-dashed border-espresso/15 p-4 text-center text-xs text-espresso/40 dark:border-cream/15 dark:text-cream/40")}>
                  Sin pedidos
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </main>
  );
}
