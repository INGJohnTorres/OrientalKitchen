"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChefHat, ClipboardList, LogOut, Package, Settings, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { cerrarSesion as cerrarSesionApi, obtenerConfiguracion, rolActual } from "@/lib/api";
import { NOMBRE_RESTAURANTE } from "@/lib/config-restaurante";
import { permiteEditorProductos, permiteEstadisticas, permitePedidos } from "@/lib/plan";
import { PlanNegocio } from "@/lib/types";

export type SeccionAdmin = "pedidos" | "cocina" | "productos" | "estadisticas" | "configuracion" | "superadmin";

const NOMBRE_PLAN: Record<PlanNegocio, string> = {
  basico: "Básico",
  medio: "Medio",
  premium: "Premium",
};

/**
 * Estructura común del panel admin: menú lateral con botones táctiles (≥56 px),
 * plan contratado y cierre de sesión. En pantallas chicas el menú pasa arriba
 * como una fila deslizable.
 */
export default function AdminShell({
  activo,
  titulo,
  subtitulo,
  acciones,
  children,
}: {
  activo: SeccionAdmin;
  titulo: string;
  subtitulo?: React.ReactNode;
  acciones?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanNegocio | null>(null);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  useEffect(() => {
    setEsSuperAdmin(rolActual() === "superadmin");
    const cargarPlan = () =>
      obtenerConfiguracion()
        .then((c) => setPlan(c.plan))
        .catch(() => setPlan("premium"));
    cargarPlan();
    window.addEventListener("configuracion-actualizada", cargarPlan);
    return () => window.removeEventListener("configuracion-actualizada", cargarPlan);
  }, []);

  function cerrarSesion() {
    sessionStorage.removeItem("admin-autenticado");
    cerrarSesionApi();
    router.push("/admin");
  }

  // Mientras no se conoce el plan se muestran todas las secciones (se evita
  // que el menú "salte"); el servidor igual rechaza lo que el plan no incluye.
  const items: { id: SeccionAdmin; label: string; href: string; Icono: typeof ClipboardList; mostrar: boolean }[] = [
    { id: "pedidos", label: "Pedidos", href: "/admin/dashboard", Icono: ClipboardList, mostrar: true },
    { id: "cocina", label: "Vista de cocina", href: "/admin/cocina", Icono: ChefHat, mostrar: plan === null || permitePedidos(plan) },
    { id: "productos", label: "Productos", href: "/admin/productos", Icono: Package, mostrar: plan === null || permiteEditorProductos(plan) },
    { id: "estadisticas", label: "Estadísticas", href: "/admin/dashboard#estadisticas", Icono: BarChart3, mostrar: plan === null || permiteEstadisticas(plan) },
    { id: "configuracion", label: "Configuración", href: "/admin/configuracion", Icono: Settings, mostrar: true },
    { id: "superadmin", label: "Superadmin", href: "/admin/superadmin", Icono: ShieldCheck, mostrar: esSuperAdmin },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-espresso font-body text-cream lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-2 border-b border-cream/10 bg-panel p-4 lg:w-[260px] lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center gap-3 px-1 pb-1 lg:pb-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ember font-display text-[15px] text-white">OK</div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-[14px] uppercase tracking-wide">{NOMBRE_RESTAURANTE}</span>
            <span className="text-[13px] text-cream/60">Panel administrativo</span>
          </div>
        </div>

        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Secciones del panel">
          {items
            .filter((i) => i.mostrar)
            .map(({ id, label, href, Icono }) => (
              <Link
                key={id}
                href={href}
                aria-current={id === activo ? "page" : undefined}
                className={clsx(
                  "flex min-h-[56px] shrink-0 items-center gap-3.5 whitespace-nowrap rounded-2xl px-4 text-base transition active:scale-[0.98]",
                  id === activo
                    ? "bg-ember font-bold text-white"
                    : "bg-tarjeta font-medium text-cream/85 hover:bg-cream/10"
                )}
              >
                <Icono size={22} strokeWidth={1.9} />
                {label}
              </Link>
            ))}
        </nav>

        <div className="hidden flex-1 lg:block" />

        <div className="hidden flex-col gap-2 rounded-[18px] border border-cream/10 bg-tarjeta p-4 lg:flex">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-cream/60">Plan contratado</span>
            <span className="rounded-full bg-mustard px-3 py-1 text-[13px] font-bold text-espresso">
              {plan ? NOMBRE_PLAN[plan] : "—"}
            </span>
          </div>
          {plan === "premium" && <span className="text-sm leading-snug text-cream/80">Soporte prioritario activo.</span>}
        </div>

        <div className="mt-1 hidden items-center gap-3 px-1 pt-3 lg:flex">
          <div
            className={clsx(
              "grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-bold",
              esSuperAdmin ? "bg-mustard text-espresso" : "bg-olive text-white"
            )}
          >
            {esSuperAdmin ? "SA" : "AD"}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-semibold">{esSuperAdmin ? "superadmin" : "admin"}</span>
            <span className="text-[13px] text-cream/60">{esSuperAdmin ? "Superadministrador" : "Administrador"}</span>
          </div>
          <button
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            className="grid h-12 w-12 place-items-center rounded-2xl border border-cream/15 text-cream/80 transition hover:border-ember hover:text-white active:scale-95"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 pb-12 pt-6 sm:px-8 lg:pt-7">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-[26px] font-bold tracking-tight sm:text-[28px]">{titulo}</h1>
            {subtitulo && <div className="text-sm text-cream/60">{subtitulo}</div>}
          </div>
          {acciones && <div className="flex flex-wrap items-center gap-3">{acciones}</div>}
          {/* Cerrar sesión también en pantallas chicas, donde el menú pasa arriba */}
          <button
            onClick={cerrarSesion}
            className="flex min-h-[48px] items-center gap-2 rounded-2xl border border-cream/15 px-4 text-sm font-medium text-cream/80 lg:hidden"
          >
            <LogOut size={18} /> Salir
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
