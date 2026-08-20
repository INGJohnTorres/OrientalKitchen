import { Pedido } from "./types";

/** Etiqueta visible en el panel admin/cocina — nunca mezcla mesa/domicilio/recoger en un mismo texto. */
export function etiquetaTipoPedido(p: Pick<Pedido, "tipoPedido" | "mesa">): string {
  if (p.tipoPedido === "domicilio") return "🛵 Domicilio";
  if (p.tipoPedido === "recoger") return "🏠 Recoger en el local";
  return `Mesa ${p.mesa ?? "—"}`;
}
