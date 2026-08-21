"use client";

import { useEffect, useState } from "react";
import { obtenerConfiguracion } from "./api";
import { PlanNegocio } from "./types";

/** El plan "medio" y "premium" incluyen pedidos (mesa/domicilio/recoger); "basico" es solo menú digital. */
export function permitePedidos(plan: PlanNegocio | null): boolean {
  return plan === "medio" || plan === "premium";
}

/** El dashboard de estadísticas de ventas es exclusivo del plan "premium". */
export function permiteEstadisticas(plan: PlanNegocio | null): boolean {
  return plan === "premium";
}

/**
 * Plan actual del negocio. Devuelve `null` mientras carga — los componentes
 * que gatean UI por esto deben tratar `null` como "no ocultar todavía" para
 * no hacer parpadear botones que probablemente sí van a estar habilitados.
 */
export function usePlan(): PlanNegocio | null {
  const [plan, setPlan] = useState<PlanNegocio | null>(null);

  useEffect(() => {
    let vigente = true;
    obtenerConfiguracion()
      .then((config) => {
        if (vigente) setPlan(config.plan);
      })
      .catch(() => {
        // Si falla la carga, se asume premium (todo habilitado) para no
        // bloquear al cliente por un error de red pasajero.
        if (vigente) setPlan("premium");
      });
    return () => {
      vigente = false;
    };
  }, []);

  return plan;
}
