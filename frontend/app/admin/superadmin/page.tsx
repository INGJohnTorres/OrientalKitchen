"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Loader2, Minus, ShieldCheck, UserCog, Activity } from "lucide-react";
import clsx from "clsx";
import { actualizarPlan, obtenerConfiguracion, obtenerPedidos, rolActual } from "@/lib/api";
import { PlanNegocio } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";

const ORDEN: PlanNegocio[] = ["basico", "medio", "premium"];

const FUNCIONES: { nombre: string; desde: PlanNegocio }[] = [
  { nombre: "Menú digital por código QR", desde: "basico" },
  { nombre: "Pedidos por WhatsApp (mesa, domicilio y recoger)", desde: "medio" },
  { nombre: "Vista de cocina y tablero de pedidos", desde: "medio" },
  { nombre: "Dashboard de estadísticas de ventas", desde: "premium" },
  { nombre: "Editor de productos del menú", desde: "premium" },
  { nombre: "Soporte prioritario", desde: "premium" },
];

const PLANES: { id: PlanNegocio; nombre: string; descripcion: string }[] = [
  { id: "basico", nombre: "Básico", descripcion: "Carta digital con código QR para tus clientes." },
  { id: "medio", nombre: "Medio", descripcion: "Suma pedidos por WhatsApp y la vista de cocina." },
  { id: "premium", nombre: "Premium", descripcion: "Todo lo anterior más estadísticas, editor y soporte prioritario." },
];

const incluye = (plan: PlanNegocio, desde: PlanNegocio) => ORDEN.indexOf(plan) >= ORDEN.indexOf(desde);
const cuentaFunciones = (plan: PlanNegocio) => FUNCIONES.filter((f) => incluye(plan, f.desde)).length;
const nombrePlan = (plan: PlanNegocio) => PLANES.find((p) => p.id === plan)?.nombre ?? plan;

type Estado = "revisando" | "ok" | "error";

export default function SuperAdminPage() {
  const router = useRouter();
  const [planActual, setPlanActual] = useState<PlanNegocio | null>(null);
  const [seleccionado, setSeleccionado] = useState<PlanNegocio | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [estadoMenu, setEstadoMenu] = useState<Estado>("revisando");
  const [estadoPanel, setEstadoPanel] = useState<Estado>("revisando");

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    if (rolActual() !== "superadmin") {
      router.push("/admin/dashboard");
      return;
    }
    setAutorizado(true);
    obtenerConfiguracion()
      .then((c) => {
        setPlanActual(c.plan);
        setSeleccionado(c.plan);
        setEstadoMenu("ok");
      })
      .catch(() => setEstadoMenu("error"));
    obtenerPedidos()
      .then(() => setEstadoPanel("ok"))
      .catch(() => setEstadoPanel("error"));
  }, [router]);

  async function guardar() {
    if (!seleccionado || seleccionado === planActual) return;
    setGuardando(true);
    setError("");
    setExito(false);
    try {
      await actualizarPlan(seleccionado);
      setPlanActual(seleccionado);
      setExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el plan.");
    } finally {
      setGuardando(false);
    }
  }

  function descartar() {
    setSeleccionado(planActual);
    setError("");
    setExito(false);
  }

  if (!autorizado) return null;

  const hayCambios = !!seleccionado && seleccionado !== planActual;
  const matriz = seleccionado ?? "basico";

  const acciones = planActual ? (
    <span className="flex h-[52px] items-center gap-2 rounded-2xl border border-cream/15 bg-tarjeta px-5 text-[15px] font-semibold">
      <ShieldCheck size={18} className="text-mustard-claro" /> Plan actual: {nombrePlan(planActual)}
    </span>
  ) : undefined;

  const estados: { nombre: string; estado: Estado }[] = [
    { nombre: "Menú público y configuración", estado: estadoMenu },
    { nombre: "Panel y pedidos", estado: estadoPanel },
  ];

  return (
    <AdminShell
      activo="superadmin"
      titulo="Planes y funcionalidades"
      subtitulo="Elige el plan contratado: el sitio y el panel se ajustan solos."
      acciones={acciones}
    >
      <section aria-label="Planes" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {PLANES.map((p) => {
          const activo = seleccionado === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSeleccionado(p.id);
                setExito(false);
              }}
              aria-pressed={activo}
              className={clsx(
                "relative flex min-h-[170px] flex-col gap-3 rounded-[24px] border-2 bg-cocoa p-6 text-left transition active:scale-[0.99]",
                activo ? "border-ember" : "border-cream/10 hover:border-cream/30"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[22px] uppercase">{p.nombre}</span>
                {activo && (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ember text-white">
                    <Check size={18} />
                  </span>
                )}
              </div>
              <p className="text-[15px] leading-snug text-cream/65">{p.descripcion}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-cream/55">{cuentaFunciones(p.id)} {cuentaFunciones(p.id) === 1 ? "funcionalidad" : "funcionalidades"}</span>
                {planActual === p.id && (
                  <span className="rounded-full bg-olive/25 px-3 py-1 text-xs font-bold uppercase tracking-wide text-olive-claro">
                    Plan actual
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-[24px] border border-cream/10 bg-cocoa">
        <h2 className="px-6 pb-3 pt-5 text-lg font-bold">Qué incluye cada plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[15px]">
            <thead>
              <tr className="border-y border-cream/10 text-left text-cream/60">
                <th className="px-6 py-3.5 font-semibold">Funcionalidad</th>
                {PLANES.map((p) => (
                  <th
                    key={p.id}
                    className={clsx(
                      "px-4 py-3.5 text-center font-semibold",
                      p.id === "premium" && "bg-mustard/10 text-mustard-claro"
                    )}
                  >
                    {p.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FUNCIONES.map((f) => (
                <tr key={f.nombre} className="border-b border-cream/[0.07] last:border-0">
                  <td className="px-6 py-4">{f.nombre}</td>
                  {PLANES.map((p) => {
                    const si = incluye(p.id, f.desde);
                    return (
                      <td key={p.id} className={clsx("px-4 py-4 text-center", p.id === "premium" && "bg-mustard/10")}>
                        {si ? (
                          <Check size={20} className="mx-auto text-olive-claro" aria-label="Incluido" />
                        ) : (
                          <Minus size={20} className="mx-auto text-cream/30" aria-label="No incluido" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hayCambios && (
          <p className="border-t border-cream/10 px-6 py-3 text-sm text-cream/60">
            Vista previa: con el plan <strong className="text-cream">{nombrePlan(matriz)}</strong> el negocio tendría{" "}
            {cuentaFunciones(matriz)} de {FUNCIONES.length} funcionalidades. Aún no se ha guardado.
          </p>
        )}
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <div className="rounded-[24px] border border-cream/10 bg-cocoa p-6">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold">
            <UserCog size={20} className="text-mustard-claro" /> Cuentas y accesos
          </h2>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center justify-between gap-3 rounded-2xl bg-tarjeta px-4 py-3.5">
              <div>
                <p className="font-semibold">admin</p>
                <p className="text-sm text-cream/55">Pedidos, cocina, estadísticas y productos según el plan</p>
              </div>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-2xl bg-tarjeta px-4 py-3.5">
              <div>
                <p className="font-semibold">superadmin</p>
                <p className="text-sm text-cream/55">Solo cambia el plan</p>
              </div>
            </li>
          </ul>
          <p className="mt-3 text-sm text-cream/45">Cada cuenta cambia su contraseña desde Configuración.</p>
        </div>

        <div className="rounded-[24px] border border-cream/10 bg-cocoa p-6">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold">
            <Activity size={20} className="text-mustard-claro" /> Estado del servicio
          </h2>
          <ul className="flex flex-col gap-3">
            {estados.map((s) => (
              <li key={s.nombre} className="flex items-center justify-between gap-3 rounded-2xl bg-tarjeta px-4 py-3.5">
                <span className="font-semibold">{s.nombre}</span>
                <span
                  className={clsx(
                    "flex items-center gap-2 text-sm font-bold",
                    s.estado === "ok" && "text-olive-claro",
                    s.estado === "error" && "text-ember-claro",
                    s.estado === "revisando" && "text-cream/50"
                  )}
                >
                  <span
                    className={clsx(
                      "h-2.5 w-2.5 rounded-full",
                      s.estado === "ok" && "bg-olive-claro",
                      s.estado === "error" && "bg-ember-claro",
                      s.estado === "revisando" && "bg-cream/40"
                    )}
                  />
                  {s.estado === "ok" ? "Operativo" : s.estado === "error" ? "Sin respuesta" : "Revisando…"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {error && <p className="text-base text-ember-claro">{error}</p>}
      {exito && (
        <p className="flex items-center gap-2 text-base text-olive-claro" role="status">
          <CheckCircle2 size={20} /> Plan actualizado correctamente.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={descartar}
          disabled={!hayCambios || guardando}
          className="h-16 min-w-[200px] flex-1 rounded-2xl border-2 border-cream/25 px-6 text-lg font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          Descartar cambios
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={!hayCambios || guardando}
          className="flex h-16 min-w-[240px] flex-1 items-center justify-center gap-2 rounded-2xl bg-ember px-8 text-lg font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          {guardando && <Loader2 size={20} className="animate-spin" />}
          Guardar plan {seleccionado ? nombrePlan(seleccionado) : ""}
        </button>
      </div>
    </AdminShell>
  );
}
