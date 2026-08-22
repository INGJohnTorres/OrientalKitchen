"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  X,
  ArrowLeft,
  Search,
  ShoppingBag,
  MessageCircle,
  Minus,
  Plus,
  Trash2,
  UtensilsCrossed,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { obtenerCategorias, obtenerProductos, crearPedido } from "@/lib/api";
import { Categoria, DatosPedidoRapido, Producto } from "@/lib/types";
import { enviarPedidoRapidoPorWhatsApp, emojiParaProducto } from "@/lib/whatsapp";
import { cuentasPago } from "@/lib/social";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";

const MapaUbicacion = dynamic(() => import("./MapaUbicacion"), {
  ssr: false,
  loading: () => (
    <div className="grid h-56 w-full place-items-center rounded-xl border border-espresso/20 text-sm text-espresso/40 dark:border-cream/20 dark:text-cream/40">
      Cargando mapa...
    </div>
  ),
});

type Paso = "productos" | "carrito" | "datos" | "pago" | "confirmacion" | "enviado";

function formatoMoneda(v: number) {
  return (v ?? 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function PedidoRapidoModal() {
  const abierto = useCartStore((s) => s.pedidoRapidoAbierto);
  const cerrar = useCartStore((s) => s.cerrarPedidoRapido);
  const tipoEntregaPreseleccionado = useCartStore((s) => s.tipoEntregaPreseleccionado);
  const { items, cambiarCantidad, quitar, vaciar, total, cantidadTotal } = useCartStore();

  const [paso, setPaso] = useState<Paso>("productos");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [datos, setDatos] = useState<DatosPedidoRapido>({
    nombre: "",
    telefono: "",
    tipoEntrega: "domicilio",
    ubicacion: undefined,
    detalleDireccion: "",
    metodoPago: "nequi",
    pagoConfirmado: false,
    observaciones: "",
  });

  useEffect(() => {
    if (!abierto) return;
    obtenerCategorias().then((cats) => {
      setCategorias(cats);
      setCategoriaActiva((actual) => actual || cats[0]?.id || "");
    });
    obtenerProductos().then(setProductos);
    // El cliente ya eligió domicilio/recoger en el botón de la landing —
    // el formulario arranca directo en esa opción, sin obligarlo a repetirla.
    setDatos((d) => ({ ...d, tipoEntrega: tipoEntregaPreseleccionado }));
  }, [abierto, tipoEntregaPreseleccionado]);

  const productosFiltrados = useMemo(() => {
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return productos.filter(
        (p) => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)
      );
    }
    return productos.filter((p) => p.categoriaId === categoriaActiva);
  }, [productos, busqueda, categoriaActiva]);

  const listaSinFotos = productosFiltrados.length > 0 && productosFiltrados.every((p) => !p.imagen);

  // Igual que en el carrito de mesa: se abre WhatsApp de forma SÍNCRONA,
  // dentro del mismo clic, para que el navegador no lo bloquee como pop-up.
  function confirmarPedido() {
    enviarPedidoRapidoPorWhatsApp(datos, items, total());

    // También lo guardamos para que aparezca en el panel admin / vista de
    // cocina, igual que los pedidos de mesa — con tipoPedido propio para que
    // el panel distinga mesa/domicilio/recoger sin adivinar por texto.
    const entrega =
      datos.tipoEntrega === "domicilio"
        ? `Domicilio: ${datos.ubicacion?.direccion ?? "(ver ubicación en WhatsApp)"}${
            datos.detalleDireccion ? ` — ${datos.detalleDireccion}` : ""
          }`
        : datos.metodoPago === "efectivo"
        ? `Recoger en el local — pago en efectivo al recoger`
        : `Recoger en el local — pago por ${datos.metodoPago === "daviplata" ? "Daviplata" : "Nequi"} (verificar comprobante)`;
    crearPedido(
      {
        nombre: datos.nombre,
        tipoPedido: datos.tipoEntrega,
        telefono: datos.telefono,
        observaciones: [entrega, datos.observaciones].filter(Boolean).join(" — "),
      },
      items,
      total()
    ).catch((err) => console.error("No se pudo guardar el pedido rápido para el panel:", err));

    setPaso("enviado");
    vaciar();
  }

  function cerrarYReiniciar() {
    cerrar();
    setTimeout(() => {
      setPaso("productos");
      setDatos({
        nombre: "",
        telefono: "",
        tipoEntrega: "domicilio",
        ubicacion: undefined,
        detalleDireccion: "",
        metodoPago: "nequi",
        pagoConfirmado: false,
        observaciones: "",
      });
    }, 300);
  }

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-espresso/70 backdrop-blur-sm sm:items-center">
      <div className="ticket flex h-[92vh] w-full max-w-xl animate-drawer-in flex-col overflow-hidden rounded-t-3xl py-5 sm:h-[85vh] sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pb-3">
          {paso !== "productos" && paso !== "enviado" ? (
            <button
              onClick={() =>
                setPaso(
                  paso === "confirmacion"
                    ? datos.tipoEntrega === "recoger"
                      ? "pago"
                      : "datos"
                    : paso === "pago"
                    ? "datos"
                    : paso === "datos"
                    ? "carrito"
                    : "productos"
                )
              }
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="font-display text-lg font-semibold">Pedido rápido</span>
          )}
          <button
            onClick={cerrarYReiniciar}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---------- PASO: elegir productos ---------- */}
        {paso === "productos" && (
          <>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 rounded-full border border-espresso/15 bg-white/60 px-4 py-2.5 dark:border-cream/15 dark:bg-cocoa/50">
                <Search size={16} className="text-espresso/50 dark:text-cream/50" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en el menú..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-espresso/40 dark:placeholder:text-cream/40"
                />
              </div>
            </div>
            {!busqueda && (
              <CategoryNav categorias={categorias} activa={categoriaActiva} onSelect={setCategoriaActiva} />
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className={listaSinFotos ? "flex flex-col gap-2" : "grid grid-cols-2 gap-3"}>
                {productosFiltrados.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
                {productosFiltrados.length === 0 && (
                  <p className="col-span-2 py-10 text-center text-sm text-espresso/50 dark:text-cream/50">
                    No encontramos productos que coincidan.
                  </p>
                )}
              </div>
            </div>
            {cantidadTotal() > 0 && (
              <div className="px-5 pt-3">
                <button
                  onClick={() => setPaso("carrito")}
                  className="flex w-full items-center justify-between rounded-full bg-ember px-5 py-3.5 font-semibold text-cream shadow-lg shadow-ember/30 transition hover:bg-ember-dark"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={18} /> Ver PEDIDO ({cantidadTotal()})
                  </span>
                  <span className="font-mono">{formatoMoneda(total())}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ---------- PASO: carrito ---------- */}
        {paso === "carrito" && (
          <div className="flex-1 overflow-y-auto px-6">
            {items.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-3 text-center text-espresso/50 dark:text-cream/50">
                <UtensilsCrossed size={28} />
                <p>Todavía no has agregado nada.</p>
                <button onClick={() => setPaso("productos")} className="mt-2 text-sm font-semibold text-ember">
                  Ver el menú
                </button>
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
              <button onClick={() => setPaso("productos")} className="mt-4 text-sm font-semibold text-ember underline decoration-dashed underline-offset-4">
                + Agregar más productos
              </button>
            )}
          </div>
        )}

        {/* ---------- PASO: datos ---------- */}
        {paso === "datos" && (
          <form
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (datos.tipoEntrega === "domicilio" && !datos.ubicacion) {
                setErrorFormulario("Marca tu ubicación en el mapa antes de continuar.");
                return;
              }
              setErrorFormulario("");
              setPaso(datos.tipoEntrega === "recoger" ? "pago" : "confirmacion");
            }}
          >
            <label className="flex flex-col gap-1 text-sm">
              Nombre
              <input
                required
                value={datos.nombre}
                onChange={(e) =>
                  setDatos({ ...datos, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "") })
                }
                className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                placeholder="Ej: Carlos"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Teléfono
              <input
                required
                inputMode="numeric"
                value={datos.telefono}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                placeholder="Ej: 3001234567"
              />
            </label>

            <div className="flex flex-col gap-1.5 text-sm">
              ¿Cómo lo quieres recibir?
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDatos({ ...datos, tipoEntrega: "domicilio" })}
                  className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    datos.tipoEntrega === "domicilio"
                      ? "border-ember bg-ember text-cream"
                      : "border-espresso/20 text-espresso/70 dark:border-cream/20 dark:text-cream/70"
                  }`}
                >
                  🛵 A domicilio
                </button>
                <button
                  type="button"
                  onClick={() => setDatos({ ...datos, tipoEntrega: "recoger" })}
                  className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    datos.tipoEntrega === "recoger"
                      ? "border-ember bg-ember text-cream"
                      : "border-espresso/20 text-espresso/70 dark:border-cream/20 dark:text-cream/70"
                  }`}
                >
                  🏠 Recoger en el local
                </button>
              </div>
            </div>

            {datos.tipoEntrega === "domicilio" && (
              <>
                <MapaUbicacion onCambiar={(ubicacion) => setDatos((d) => ({ ...d, ubicacion }))} />
                <label className="flex flex-col gap-1 text-sm">
                  Detalles adicionales (apto, torre, indicaciones)
                  <input
                    value={datos.detalleDireccion}
                    onChange={(e) => setDatos({ ...datos, detalleDireccion: e.target.value })}
                    className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                    placeholder="Ej: Torre 3, apto 301, portería azul"
                  />
                </label>
              </>
            )}

            {datos.tipoEntrega === "recoger" && (
              <div className="flex flex-col gap-2">
                <p className="rounded-lg bg-mustard/10 px-3 py-2.5 text-xs text-mustard">
                  Para recoger en el local, en el siguiente paso eliges cómo pagar: por adelantado
                  (Nequi o Daviplata) o en efectivo al recoger tu pedido.
                </p>
                <p className="rounded-lg bg-espresso/5 px-3 py-2.5 text-xs text-espresso/60 dark:bg-cream/5 dark:text-cream/60">
                  ⏱️ Tiempo estimado de alistamiento: 15 a 30 min.
                </p>
              </div>
            )}

            <label className="flex flex-col gap-1 text-sm">
              Observaciones (opcional)
              <textarea
                value={datos.observaciones}
                onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
                className="rounded-lg border border-espresso/20 bg-transparent px-3 py-2 outline-none focus:border-ember dark:border-cream/20"
                placeholder="Ej: Sin cebolla, poco picante"
                rows={2}
              />
            </label>

            {errorFormulario && <p className="text-sm text-ember">{errorFormulario}</p>}

            <button type="submit" className="mt-2 rounded-full bg-ember py-3 font-semibold text-cream transition hover:bg-ember-dark">
              {datos.tipoEntrega === "recoger" ? "Continuar al pago" : "Revisar pedido"}
            </button>
          </form>
        )}

        {/* ---------- PASO: pago anticipado (solo "recoger en el local") ---------- */}
        {paso === "pago" && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pt-2">
            <p className="text-sm text-espresso/70 dark:text-cream/70">
              Para recoger en el local, elige cómo quieres pagar tu pedido.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDatos({ ...datos, metodoPago: "nequi", pagoConfirmado: false })}
                className={`flex-1 rounded-full border px-3 py-2.5 text-sm font-medium transition ${
                  datos.metodoPago === "nequi"
                    ? "border-ember bg-ember text-cream"
                    : "border-espresso/20 text-espresso/70 dark:border-cream/20 dark:text-cream/70"
                }`}
              >
                Nequi
              </button>
              <button
                type="button"
                onClick={() => setDatos({ ...datos, metodoPago: "daviplata", pagoConfirmado: false })}
                className={`flex-1 rounded-full border px-3 py-2.5 text-sm font-medium transition ${
                  datos.metodoPago === "daviplata"
                    ? "border-ember bg-ember text-cream"
                    : "border-espresso/20 text-espresso/70 dark:border-cream/20 dark:text-cream/70"
                }`}
              >
                Daviplata
              </button>
              <button
                type="button"
                onClick={() => setDatos({ ...datos, metodoPago: "efectivo", pagoConfirmado: false })}
                className={`flex-1 rounded-full border px-3 py-2.5 text-sm font-medium transition ${
                  datos.metodoPago === "efectivo"
                    ? "border-ember bg-ember text-cream"
                    : "border-espresso/20 text-espresso/70 dark:border-cream/20 dark:text-cream/70"
                }`}
              >
                💵 Efectivo
              </button>
            </div>

            {datos.metodoPago === "efectivo" ? (
              <>
                <p className="rounded-lg bg-espresso/5 px-3 py-2.5 text-xs text-espresso/60 dark:bg-cream/5 dark:text-cream/60">
                  Pagarás en efectivo directamente en el local al recoger tu pedido. Total a pagar:{" "}
                  <span className="font-mono font-semibold">{formatoMoneda(total())}</span>
                </p>

                <button
                  onClick={() => setPaso("confirmacion")}
                  className="flex items-center justify-center gap-2 rounded-full bg-ember py-3 font-semibold text-cream transition hover:bg-ember-dark"
                >
                  <CheckCircle2 size={18} /> Continuar
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-espresso/70 dark:text-cream/70">
                  Transfiere el total de tu pedido a esta cuenta y adjunta el comprobante en el
                  chat de WhatsApp cuando lo enviemos.
                </p>

                <div className="flex items-center justify-between rounded-xl border border-dashed border-mustard/50 bg-mustard/10 px-4 py-3.5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-mustard">
                      {datos.metodoPago === "daviplata" ? "Daviplata" : "Nequi"} de Oriental Kitchen
                    </p>
                    <p className="font-mono text-lg font-semibold">
                      {datos.metodoPago === "daviplata" ? cuentasPago.daviplata : cuentasPago.nequi}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        datos.metodoPago === "daviplata" ? cuentasPago.daviplata : cuentasPago.nequi
                      )
                    }
                    aria-label="Copiar número"
                    className="grid h-9 w-9 place-items-center rounded-full bg-espresso/10 text-espresso/70 dark:bg-cream/10 dark:text-cream/70"
                  >
                    <Copy size={15} />
                  </button>
                </div>

                <p className="rounded-lg bg-espresso/5 px-3 py-2.5 text-xs text-espresso/60 dark:bg-cream/5 dark:text-cream/60">
                  Total a transferir: <span className="font-mono font-semibold">{formatoMoneda(total())}</span>
                </p>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-espresso/15 px-3 py-3 text-sm dark:border-cream/15">
                  <input
                    type="checkbox"
                    checked={datos.pagoConfirmado}
                    onChange={(e) => setDatos({ ...datos, pagoConfirmado: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-ember"
                  />
                  Ya realicé la transferencia y voy a enviar el comprobante por este chat de WhatsApp.
                </label>

                <button
                  disabled={!datos.pagoConfirmado}
                  onClick={() => setPaso("confirmacion")}
                  className="flex items-center justify-center gap-2 rounded-full bg-ember py-3 font-semibold text-cream transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 size={18} /> Continuar
                </button>
              </>
            )}
          </div>
        )}

        {/* ---------- PASO: confirmación ---------- */}
        {paso === "confirmacion" && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pt-2">
            <p className="text-sm text-espresso/60 dark:text-cream/60">
              Revisa tu pedido antes de enviarlo al restaurante.
            </p>
            <div className="rounded-lg border border-dashed border-espresso/20 p-4 font-mono text-sm dark:border-cream/20">
              <p>Cliente: {datos.nombre}</p>
              <p>Teléfono: {datos.telefono}</p>
              {datos.tipoEntrega === "domicilio" ? (
                <>
                  <p>Domicilio: {datos.ubicacion?.direccion}</p>
                  {datos.detalleDireccion && <p>Detalle: {datos.detalleDireccion}</p>}
                </>
              ) : (
                <>
                  <p>
                    {datos.metodoPago === "efectivo"
                      ? "Recoger en el local — pago en efectivo al recoger"
                      : `Recoger en el local — pago por ${datos.metodoPago === "daviplata" ? "Daviplata" : "Nequi"} ✓`}
                  </p>
                  <p>Tiempo estimado: 15 a 30 min</p>
                </>
              )}
              <div className="my-2 border-t border-dashed border-espresso/20 dark:border-cream/20" />
              {items.map((item) => (
                <p key={item.claveUnica}>
                  {emojiParaProducto(item.nombre)} {item.cantidad} {item.nombre}
                </p>
              ))}
              {datos.observaciones && (
                <>
                  <div className="my-2 border-t border-dashed border-espresso/20 dark:border-cream/20" />
                  <p>Obs: {datos.observaciones}</p>
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

        {/* ---------- PASO: enviado ---------- */}
        {paso === "enviado" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-olive/20 text-olive">
              <MessageCircle size={28} />
            </div>
            <p className="font-display text-xl font-semibold">¡Pedido enviado!</p>
            <p className="max-w-xs text-sm text-espresso/60 dark:text-cream/60">
              Se abrió WhatsApp con tu PEDIDO listo para enviar al restaurante. En breve lo confirmarán.
            </p>
            <button onClick={cerrarYReiniciar} className="mt-2 rounded-full bg-ember px-6 py-2.5 font-semibold text-cream">
              Cerrar
            </button>
          </div>
        )}

        {paso === "carrito" && items.length > 0 && (
          <div className="px-6 pt-4">
            <div className="mb-3 flex items-center justify-between font-mono text-lg font-semibold">
              <span>Total</span>
              <span>{formatoMoneda(total())}</span>
            </div>
            <button
              onClick={() => setPaso("datos")}
              className="w-full rounded-full bg-espresso py-3 font-semibold text-cream transition hover:bg-espresso/90 dark:bg-ember"
            >
              Continuar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
