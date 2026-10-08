import { NextResponse } from "next/server";

/** Error con codigo HTTP: se convierte en respuesta JSON `{ error: ... }` en `manejar`. */
export class HttpError extends Error {
  constructor(public status: number, public body: unknown) {
    super(typeof body === "string" ? body : "HttpError");
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function sinContenido() {
  return new NextResponse(null, { status: 204 });
}

/** Lee el JSON del cuerpo; devuelve null si viene vacio o invalido. */
export async function leerJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}

/**
 * Envuelve un handler de ruta: los HttpError salen como JSON con su codigo y
 * cualquier otro error se registra y responde un 500 limpio (igual que el
 * manejador de errores centralizado que tenia el backend Express).
 */
export function manejar<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        const body = typeof err.body === "string" ? { error: err.body } : err.body;
        return NextResponse.json(body, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
  };
}
