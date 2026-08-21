"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Check, Loader2, CheckCircle2 } from "lucide-react";
import { actualizarPlan, obtenerConfiguracion, rolActual } from "@/lib/api";
import { PlanNegocio } from "@/lib/types";

const PLANES: {
  id: PlanNegocio;
  nombre: string;
  incluye: string[];
}[] = [
  {
    id: "basico",
    nombre: "Básico",
    incluye: ["Menú digital por código QR"],
  },
  {
    id: "medio",
    nombre: "Medio",
    incluye: ["Menú digital por código QR", "Pedidos por WhatsApp (mesa, domicilio y recoger)"],
  },
  {
    id: "premium",
    nombre: "Premium",
    incluye: [
      "Menú digital por código QR",
      "Pedidos por WhatsApp (mesa, domicilio y recoger)",
      "Dashboard de estadísticas de ventas",
      "Editor de productos del menú",
      "Soporte prioritario",
    ],
  },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const [planActual, setPlanActual] = useState<PlanNegocio | null>(null);
  const [seleccionado, setSeleccionado] = useState<PlanNegocio | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    if (rolActual() !== "superadmin") {
      router.push("/admin/dashboard");
      return;
    }
    obtenerConfiguracion().then((c) => {
      setPlanActual(c.plan);
      setSeleccionado(c.plan);
    });
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

  if (rolActual() !== "superadmin") return null;

  return (
    <main className="min-h-screen bg-parchment pb-24 dark:bg-espresso dark:text-cream">
      <header className="flex items-center gap-3 border-b border-espresso/10 bg-white/60 px-6 py-4 dark:border-cream/10 dark:bg-cocoa/40">
        <Link href="/admin/dashboard" className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="flex items-center gap-2 font-display text-xl font-semibold">
          <ShieldCheck size={20} className="text-ember" /> Superadministrador
        </h1>
      </header>

      <div className="mx-auto mt-6 max-w-3xl px-4">
        <p className="mb-6 text-sm text-espresso/60 dark:text-cream/60">
          Elige el plan contratado para este negocio. Las funcionalidades del sitio y del panel se
          habilitan o deshabilitan automáticamente según el plan activo.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANES.map((p) => {
            const activo = seleccionado === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSeleccionado(p.id)}
                className={`flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition ${
                  activo
                    ? "border-ember bg-ember/5 dark:bg-ember/10"
                    : "border-espresso/10 bg-white/60 hover:border-espresso/30 dark:border-cream/10 dark:bg-cocoa/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">{p.nombre}</span>
                  {planActual === p.id && (
                    <span className="rounded-full bg-olive/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-olive">
                      Plan actual
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-espresso/70 dark:text-cream/70">
                  {p.incluye.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check size={15} className="mt-0.5 shrink-0 text-olive" /> {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-ember">{error}</p>}
        {exito && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-olive">
            <CheckCircle2 size={16} /> Plan actualizado correctamente.
          </p>
        )}

        <button
          onClick={guardar}
          disabled={guardando || !seleccionado || seleccionado === planActual}
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 font-semibold text-cream transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {guardando && <Loader2 size={16} className="animate-spin" />}
          Guardar plan
        </button>
      </div>
    </main>
  );
}
