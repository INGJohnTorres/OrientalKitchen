"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Loader2 } from "lucide-react";
import { iniciarSesion } from "@/lib/api";
import { NOMBRE_RESTAURANTE } from "@/lib/config-restaurante";

const campo =
  "h-14 rounded-2xl border border-cream/20 bg-transparent px-4 text-base outline-none focus:border-ember";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const ok = await iniciarSesion(usuario, clave);
      if (ok) {
        sessionStorage.setItem("admin-autenticado", "true");
        router.push("/admin/dashboard");
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-espresso px-4 py-8 text-cream">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[28px] border border-cream/10 bg-cocoa p-8 shadow-xl sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ember/20 text-ember-claro">
            <LockKeyhole size={28} />
          </div>
          <h1 className="font-display text-2xl uppercase">Panel administrativo</h1>
          <p className="text-base text-cream/60">{NOMBRE_RESTAURANTE}</p>
        </div>

        <label className="mb-4 flex flex-col gap-1.5 text-[15px]">
          Usuario
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className={campo}
            placeholder="admin"
            autoComplete="username"
            autoCapitalize="none"
          />
        </label>
        <label className="mb-5 flex flex-col gap-1.5 text-[15px]">
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className={campo}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p role="alert" className="mb-4 text-[15px] text-ember-claro">
            {error}
          </p>
        )}

        <button
          disabled={cargando}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-ember text-lg font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {cargando && <Loader2 size={20} className="animate-spin" />}
          Ingresar
        </button>
        <p className="mt-5 text-center text-sm text-cream/45">
          Acceso restringido — solo personal autorizado.
        </p>
      </form>
    </main>
  );
}
