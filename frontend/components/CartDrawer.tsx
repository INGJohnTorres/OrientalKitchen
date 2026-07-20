"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, X, MessageCircle, ArrowLeft, UtensilsCrossed } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { DatosCliente } from "@/lib/types";
import { enviarPedidoPorWhatsApp } from "@/lib/whatsapp";
import { crearPedido } from "@/lib/api";

type Paso = "carrito" | "datos" | "confirmacion" | "enviado";

function formatoMoneda(v: number) {
  return (v ?? 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, cambiarCantidad, quitar, vaciar, total, mesa, setMesa } = useCartStore();
  const [paso, setPaso] = useState<Paso>("carrito");
  const [cliente, setCliente] = useState<DatosCliente>({
    nombre: "",
    mesa: mesa || "",
    observaciones: "",
    telefono: "",
  });

  // IMPORTANTE: esta función es SÍNCRONA. Abrimos WhatsApp de inmediato,
  // dentro del mismo clic del usuario, para que el navegador no lo bloquee
  // como pop-up. Guardar el pedido (para el panel/cocina) ocurre después,
  // sin bloquear la apertura de WhatsApp.
  function confirmarPedido() {
    enviarPedidoPorWhatsApp(cliente, items, total());
    crearPedido(cliente, items, total()).catch((err) =>
      console.error("No se pudo guardar el pedido para el panel de cocina:", err)
    );
    setPaso("enviado");
    vaciar();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-espresso/40 backdrop-blur-sm">
      <div className="ticket flex h-full w-full max-w-md animate-drawer-in flex-col overflow-hidden py-6">
        <div className="flex items-center justify-between px-6 pb-4">
          {paso !== "carrito" && paso !== "enviado" ? (
            <button
              onClick={() => setPaso(paso === "confirmacion" ? "datos" : "carrito")}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="font-display text-lg font-semibold">Tu comanda</span>
          )}
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {paso === "carrito" && (
            <>
              {items.length === 0 ? (
                <div className="mt-16 flex flex-col items-center gap-3 text-center text-espresso/50 dark:text-cream/50">
                  <UtensilsCrossed size={28} />
                  <p>Tu carrito está vacío.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li key={item.claveUnica} className="flex gap-3 border-b border-dashed border-espresso/15 pb-4 dark:border-cream/15">
                      {item.imagen && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium leading-tight">{item.nombre}</span>
                          <button onClick={() => quitar(item.claveUnica)} className="shrink-0 text-espresso/40 hover:text-ember">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="font-mono text-xs text-espresso/60 dark:text-cream/60">
                          {formatoMoneda(item.precioUnitario)} c/u
                        </span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-espresso/15 px-1 py-0.5 dark:border-cream/15">
                            <button onClick={() => cambiarCantidad(item.claveUnica, item.cantidad - 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center font-mono text-xs">{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.claveUnica, item.cantidad + 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-semibold">
                            {formatoMoneda(item.precioUnitario * item.cantidad)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {items.length > 0 && (
                <button onClick={vaciar} className="mt-4 text-sm text-ember-dark underline decoration-dashed underline-offset-4">
                  Vaciar carrito
                </button>
              )}
            </>
          )}

          {paso === "datos" && (
            <form
              className="flex flex-col gap-4 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                setPaso("confirmacion");
              }}
            >
              <label className="flex flex-col gap-1 text-sm">
                Nombre
                <input
                  required
                  value={cliente.nombre}
                  onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                  placeholder="Ej: Carlos"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Número de mesa
                <input
                  required
                  value={cliente.mesa}
                  onChange={(e) => setCliente({ ...cliente, mesa: e.target.value })}
                  className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                  placeholder="Ej: 8"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Observaciones (opcional)
                <textarea
                  value={cliente.observaciones}
                  onChange={(e) => setCliente({ ...cliente, observaciones: e.target.value })}
                  className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                  placeholder="Ej: Sin cebolla, poco picante"
                  rows={2}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Teléfono (opcional)
                <input
                  value={cliente.telefono}
                  onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                  className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                  placeholder="Ej: 3001234567"
                />
              </label>
              <button type="submit" className="mt-2 rounded-full bg-ember py-3 font-semibold text-cream transition hover:bg-ember-dark">
                Revisar pedido
              </button>
            </form>
          )}

          {paso === "confirmacion" && (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-sm text-espresso/60 dark:text-cream/60">
                Revisa tu pedido antes de enviarlo al restaurante.
              </p>
              <div className="rounded-lg border border-dashed border-espresso/20 p-4 font-mono text-sm dark:border-cream/20">
                <p>Mesa: {cliente.mesa}</p>
                <p>Cliente: {cliente.nombre}</p>
                <div className="my-2 border-t border-dashed border-espresso/20 dark:border-cream/20" />
                {items.map((item) => (
                  <p key={item.claveUnica}>
                    {item.cantidad} {item.nombre}
                  </p>
                ))}
                {cliente.observaciones && (
                  <>
                    <div className="my-2 border-t border-dashed border-espresso/20 dark:border-cream/20" />
                    <p>Obs: {cliente.observaciones}</p>
                  </>
                )}
                <div className="my-2 border-t border-dashed border-espresso/20 dark:border-cream/20" />
                <p className="text-base font-semibold">Total: {formatoMoneda(total())}</p>
              </div>
              <button
                onClick={confirmarPedido}
                className="flex items-center justify-center gap-2 rounded-full bg-olive py-3 font-semibold text-cream transition hover:brightness-110"
              >
                <MessageCircle size={18} />
                Confirmar y enviar por WhatsApp
              </button>
            </div>
          )}

          {paso === "enviado" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 pt-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-olive/20 text-olive">
                <MessageCircle size={28} />
              </div>
              <p className="font-display text-xl font-semibold">¡Pedido enviado!</p>
              <p className="max-w-xs text-sm text-espresso/60 dark:text-cream/60">
                Se abrió WhatsApp con tu comanda lista para enviar al restaurante. En breve la confirmarán.
              </p>
              <button onClick={onClose} className="mt-2 rounded-full bg-ember px-6 py-2.5 font-semibold text-cream">
                Volver al menú
              </button>
            </div>
          )}
        </div>

        {paso === "carrito" && items.length > 0 && (
          <div className="px-6 pt-4">
            <div className="mb-3 flex items-center justify-between font-mono text-lg font-semibold">
              <span>Total</span>
              <span>{formatoMoneda(total())}</span>
            </div>
            <button
              onClick={() => setPaso("datos")}
              className="w-full rounded-full bg-ember py-3 font-semibold text-cream shadow-lg shadow-ember/30 transition hover:bg-ember-dark"
            >
              Continuar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
