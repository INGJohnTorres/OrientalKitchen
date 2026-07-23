"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { cambiarClave } from "@/lib/api";

export default function ConfiguracionPage() {
  const router = useRouter();
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito(false);

    if (claveNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (claveNueva !== confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setCargando(true);
    const resultado = await cambiarClave(claveActual, claveNueva);
    setCargando(false);

    if (resultado.ok) {
      setExito(true);
      setClaveActual("");
      setClaveNueva("");
      setConfirmar("");
    } else {
      setError(resultado.error || "No se pudo cambiar la contraseña.");
    }
  }

  return (
    <main className="min-h-screen bg-parchment pb-24 dark:bg-espresso dark:text-cream">
      <header className="flex items-center gap-3 border-b border-espresso/10 bg-white/60 px-6 py-4 dark:border-cream/10 dark:bg-cocoa/40">
        <Link href="/admin/dashboard" className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-xl font-semibold">Configuración</h1>
      </header>

      <div className="mx-auto mt-6 max-w-md px-4">
        <div className="rounded-2xl border border-espresso/10 bg-white/60 p-6 dark:border-cream/10 dark:bg-cocoa/40">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-ember/15 text-ember">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="font-display font-semibold">Cambiar contraseña</h2>
              <p className="text-xs text-espresso/50 dark:text-cream/50">Del usuario admin del panel</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Contraseña actual
              <input
                type="password"
                required
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
                className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Contraseña nueva
              <input
                type="password"
                required
                minLength={6}
                value={claveNueva}
                onChange={(e) => setClaveNueva(e.target.value)}
                className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Confirmar contraseña nueva
              <input
                type="password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
              />
            </label>

            {error && <p className="text-sm text-ember">{error}</p>}
            {exito && (
              <p className="flex items-center gap-1.5 text-sm text-olive">
                <CheckCircle2 size={16} /> Contraseña actualizada. Úsala la próxima vez que inicies sesión.
              </p>
            )}

            <button
              disabled={cargando}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ember py-3 font-semibold text-cream transition hover:bg-ember-dark disabled:opacity-60"
            >
              {cargando && <Loader2 size={16} className="animate-spin" />}
              Guardar contraseña nueva
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-espresso/40 dark:text-cream/40">
          Esta función necesita el backend conectado (Postgres). En modo demo sin backend no hay dónde guardar la contraseña nueva.
        </p>
      </div>
    </main>
  );
}
