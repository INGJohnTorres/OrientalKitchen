"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { cambiarClave } from "@/lib/api";
import AdminShell from "@/components/admin/AdminShell";

const campo =
  "h-14 rounded-2xl border border-cream/20 bg-transparent px-4 text-base outline-none focus:border-ember";

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
    <AdminShell activo="configuracion" titulo="Configuración" subtitulo="Seguridad de tu cuenta">
      <div className="w-full max-w-lg">
        <div className="rounded-[22px] border border-cream/10 bg-cocoa p-6">
          <div className="mb-6 flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ember/20 text-ember-claro">
              <KeyRound size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cambiar contraseña</h2>
              <p className="text-sm text-cream/60">De la cuenta con la que iniciaste sesión</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[15px]">
              Contraseña actual
              <input
                type="password"
                required
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
                className={campo}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[15px]">
              Contraseña nueva
              <input
                type="password"
                required
                minLength={6}
                value={claveNueva}
                onChange={(e) => setClaveNueva(e.target.value)}
                className={campo}
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[15px]">
              Confirmar contraseña nueva
              <input
                type="password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className={campo}
              />
            </label>

            {error && <p className="text-[15px] text-ember-claro">{error}</p>}
            {exito && (
              <p className="flex items-center gap-2 text-[15px] text-olive-claro">
                <CheckCircle2 size={18} /> Contraseña actualizada. Úsala la próxima vez que inicies sesión.
              </p>
            )}

            <button
              disabled={cargando}
              className="mt-2 flex h-14 items-center justify-center gap-2 rounded-2xl bg-ember text-lg font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {cargando && <Loader2 size={18} className="animate-spin" />}
              Guardar contraseña nueva
            </button>
          </form>
        </div>

        <p className="mt-4 text-sm text-cream/45">
          Esta función necesita el backend conectado (Postgres). En modo demo sin backend no hay dónde guardar la contraseña nueva.
        </p>
      </div>
    </AdminShell>
  );
}
