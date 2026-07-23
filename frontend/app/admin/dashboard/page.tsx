"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, DollarSign, ClipboardList, ChefHat, Package } from "lucide-react";
import { actualizarEstadoPedido, obtenerPedidos } from "@/lib/api";
import { emojiParaProducto } from "@/lib/whatsapp";
import { EstadoPedido, Pedido } from "@/lib/types";
import clsx from "clsx";

const columnas: { estado: EstadoPedido; titulo: string }[] = [
  { estado: "nuevo", titulo: "Nuevos" },
  { estado: "preparando", titulo: "En preparación" },
  { estado: "listo", titulo: "Listos" },
  { estado: "entregado", titulo: "Entregados" },
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

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
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

  function cerrarSesion() {
    sessionStorage.removeItem("admin-autenticado");
    router.push("/admin");
  }

  const hoy = new Date().toDateString();
  const ventasHoy = pedidos
    .filter((p) => new Date(p.creadoEn).toDateString() === hoy && p.estado !== "cancelado")
    .reduce((acc, p) => acc + p.total, 0);
  const ventasTotales = pedidos
    .filter((p) => p.estado !== "cancelado")
    .reduce((acc, p) => acc + p.total, 0);

  return (
    <main className="min-h-screen bg-parchment dark:bg-espresso dark:text-cream">
      <header className="flex items-center justify-between border-b border-espresso/10 bg-white/60 px-6 py-4 dark:border-cream/10 dark:bg-cocoa/40">
        <h1 className="font-display text-xl font-semibold">Panel — Oriental Kitchen</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/productos"
            className="flex items-center gap-1.5 rounded-full border border-espresso/20 px-4 py-2 text-sm font-medium transition hover:border-ember hover:text-ember dark:border-cream/20"
          >
            <Package size={16} /> Editar productos
          </Link>
          <Link
            href="/admin/cocina"
            className="flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-sm font-medium text-cream transition hover:bg-ember-dark"
          >
            <ChefHat size={16} /> Vista de cocina
          </Link>
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
          <div>
            <p className="text-xs text-espresso/50 dark:text-cream/50">Pedidos totales</p>
            <p className="font-mono text-lg font-semibold">{pedidos.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 pb-8 lg:grid-cols-4">
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
                    <p>Mesa {p.mesa} — {p.cliente}</p>
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
    </main>
  );
}
