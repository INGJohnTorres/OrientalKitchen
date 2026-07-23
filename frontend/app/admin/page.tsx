"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

// Demo: credenciales fijas en el cliente para que el panel funcione sin backend.
// TODO: conectar backend — reemplazar por POST a `${API_URL}/auth/login`,
// guardar el JWT devuelto (p. ej. en una cookie httpOnly) y validar en el servidor.
const USUARIO_DEMO = "admin";
const CLAVE_DEMO = "administrador1051";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usuario === USUARIO_DEMO && clave === CLAVE_DEMO) {
      sessionStorage.setItem("admin-autenticado", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-espresso px-4 text-cream">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-cream/10 bg-cocoa/60 p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-ember/20 text-ember">
            <LockKeyhole size={20} />
          </div>
          <h1 className="font-display text-xl font-semibold">Panel administrativo</h1>
          <p className="text-sm text-cream/50">Oriental Kitchen</p>
        </div>

        <label className="mb-3 flex flex-col gap-1 text-sm">
          Usuario
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="rounded-lg border border-cream/20 bg-transparent px-3 py-2 outline-none focus:border-ember"
            placeholder="admin"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1 text-sm">
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="rounded-lg border border-cream/20 bg-transparent px-3 py-2 outline-none focus:border-ember"
            placeholder="••••••••"
          />
        </label>

        {error && <p className="mb-3 text-sm text-ember">{error}</p>}

        <button className="w-full rounded-full bg-ember py-3 font-semibold transition hover:bg-ember-dark">
          Ingresar
        </button>
        <p className="mt-4 text-center text-xs text-cream/40">
          Demo: admin / admin123
        </p>
      </form>
    </main>
  );
}
