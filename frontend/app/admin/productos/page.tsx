"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import Image from "next/image";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  ImagePlus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  obtenerCategorias,
  obtenerProductosAdmin,
  guardarProducto,
  eliminarProducto,
  restablecerCatalogo,
  exportarCatalogoJSON,
  modoBackend,
  obtenerConfiguracion,
} from "@/lib/api";
import { comprimirImagen } from "@/lib/image-utils";
import { Categoria, Etiqueta, Producto, Variante } from "@/lib/types";
import { permiteEditorProductos } from "@/lib/plan";
import { NOMBRE_RESTAURANTE } from "@/lib/config-restaurante";

const ETIQUETAS: Etiqueta[] = ["Nuevo", "Picante", "Vegetariano", "Promoción"];

function formatoMoneda(v: number) {
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function nuevoId(prefijo: string) {
  return `${prefijo}-${Date.now().toString(36)}`;
}

export default function EditorProductos() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null);
  const [guardadoId, setGuardadoId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin-autenticado") !== "true") {
      router.push("/admin");
      return;
    }
    obtenerConfiguracion().then((c) => {
      if (!permiteEditorProductos(c.plan)) router.push("/admin/dashboard");
    });
    (async () => {
      setCategorias(await obtenerCategorias());
      setProductos(await obtenerProductosAdmin());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function marcarGuardado(id: string) {
    setGuardadoId(id);
    setTimeout(() => setGuardadoId((actual) => (actual === id ? null : actual)), 1000);
  }

  async function actualizar(producto: Producto) {
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? producto : p)));
    await guardarProducto(producto);
    marcarGuardado(producto.id);
  }

  async function eliminar(producto: Producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    setProductos((prev) => prev.filter((p) => p.id !== producto.id));
    await eliminarProducto(producto.id);
  }

  async function agregarProducto(categoriaId: string) {
    const nuevo: Producto = {
      id: nuevoId("prod"),
      categoriaId,
      nombre: "Nuevo producto",
      descripcion: "",
      precio: 0,
      activo: true,
    };
    setProductos((prev) => [...prev, nuevo]);
    await guardarProducto(nuevo);
    setCategoriaAbierta(categoriaId);
  }

  async function subirFoto(producto: Producto, archivo: File) {
    try {
      const dataUrl = await comprimirImagen(archivo);
      await actualizar({ ...producto, imagen: dataUrl });
    } catch (e) {
      alert("No se pudo procesar la imagen. Intenta con otra foto.");
    }
  }

  function agregarVariante(producto: Producto) {
    const variantes = [...(producto.variantes || []), { id: nuevoId("var"), nombre: "Nueva opción", precio: producto.precio }];
    actualizar({ ...producto, variantes });
  }

  function actualizarVariante(producto: Producto, varianteId: string, cambios: Partial<Variante>) {
    const variantes = (producto.variantes || []).map((v) => (v.id === varianteId ? { ...v, ...cambios } : v));
    actualizar({ ...producto, variantes });
  }

  function eliminarVariante(producto: Producto, varianteId: string) {
    const variantes = (producto.variantes || []).filter((v) => v.id !== varianteId);
    actualizar({ ...producto, variantes });
  }

  async function descargarExport() {
    const json = await exportarCatalogoJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogo-${NOMBRE_RESTAURANTE.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function restablecer() {
    if (!confirm("Esto borra todos tus cambios locales y vuelve al menú original. ¿Continuar?")) return;
    restablecerCatalogo();
    setCategorias(await obtenerCategorias());
    setProductos(await obtenerProductosAdmin());
  }


  const campo =
    "rounded-xl border border-cream/20 bg-transparent px-3.5 text-base outline-none focus:border-ember";

  const acciones = !modoBackend() ? (
    <>
      <button
        onClick={descargarExport}
        className="flex h-[52px] items-center gap-2 rounded-2xl border border-cream/20 px-5 text-[15px] font-medium transition active:scale-[0.98]"
      >
        <Download size={18} /> Exportar catálogo
      </button>
      <button
        onClick={restablecer}
        className="flex h-[52px] items-center gap-2 rounded-2xl border border-cream/20 px-5 text-[15px] font-medium text-ember-claro transition active:scale-[0.98]"
      >
        <RotateCcw size={18} /> Restablecer
      </button>
    </>
  ) : undefined;

  return (
    <AdminShell
      activo="productos"
      titulo="Editor de productos"
      subtitulo="Los cambios se guardan al salir de cada campo."
      acciones={acciones}
    >
      {modoBackend() ? (
        <div className="flex gap-3 rounded-2xl border border-olive/40 bg-olive/10 p-4 text-[15px] leading-relaxed">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-olive-claro" />
          <p>
            <strong>Backend conectado:</strong> estos cambios se guardan directo en la base de datos
            real — se ven de inmediato para cualquier cliente que escanee el QR, sin que tengas que
            exportar ni avisarme nada.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 rounded-2xl border border-mustard/40 bg-mustard/10 p-4 text-[15px] leading-relaxed">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-mustard-claro" />
          <p>
            <strong>Importante:</strong> estos cambios se guardan solo en este navegador. Un cliente que
            escanea el QR desde su celular todavía no los ve — eso requiere conectar el backend. Mientras
            tanto, usa <strong>Exportar catálogo</strong> y envíame ese archivo para hacer el cambio
            permanente para todos.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {categorias.map((cat) => {
          const productosCategoria = productos.filter((p) => p.categoriaId === cat.id);
          const abierta = categoriaAbierta === cat.id;
          return (
            <div key={cat.id} className="overflow-hidden rounded-[22px] border border-cream/10 bg-cocoa">
              <button
                onClick={() => setCategoriaAbierta(abierta ? null : cat.id)}
                aria-expanded={abierta}
                className="flex min-h-[64px] w-full items-center justify-between px-5 text-left"
              >
                <span className="font-display text-[17px] uppercase">
                  {cat.nombre} <span className="font-body text-base font-normal normal-case text-cream/55">({productosCategoria.length})</span>
                </span>
                {abierta ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
              </button>

              {abierta && (
                <div className="flex flex-col gap-4 border-t border-cream/10 p-4 sm:p-5">
                  {productosCategoria.map((producto) => (
                    <div key={producto.id} className="rounded-[20px] border border-cream/10 bg-tarjeta p-4 sm:p-5">
                      <div className="flex flex-wrap gap-4">
                        <label className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-cream/25">
                          {producto.imagen ? (
                            <Image src={producto.imagen} alt={producto.nombre} fill sizes="96px" className="object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-cream/40">
                              <ImagePlus size={26} />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const archivo = e.target.files?.[0];
                              if (archivo) subirFoto(producto, archivo);
                            }}
                          />
                        </label>

                        <div className="flex min-w-[240px] flex-1 flex-col gap-3">
                          <div className="flex flex-wrap gap-2">
                            <input
                              value={producto.nombre}
                              onChange={(e) => setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, nombre: e.target.value } : p)))}
                              onBlur={() => actualizar(productos.find((p) => p.id === producto.id)!)}
                              className={`h-12 min-w-[180px] flex-1 font-semibold ${campo}`}
                              placeholder="Nombre del producto"
                              aria-label="Nombre del producto"
                            />
                            <div className="flex h-12 items-center gap-1 rounded-xl border border-cream/20 px-3.5">
                              <span className="text-base text-cream/55">$</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={producto.precio}
                                onChange={(e) =>
                                  setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, precio: Number(e.target.value) } : p)))
                                }
                                onBlur={() => actualizar(productos.find((p) => p.id === producto.id)!)}
                                className="w-28 bg-transparent text-right text-base tabular-nums outline-none"
                                aria-label="Precio"
                              />
                            </div>
                          </div>

                          <textarea
                            value={producto.descripcion}
                            onChange={(e) => setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, descripcion: e.target.value } : p)))}
                            onBlur={() => actualizar(productos.find((p) => p.id === producto.id)!)}
                            rows={2}
                            className={`py-2.5 ${campo}`}
                            placeholder="Descripción"
                            aria-label="Descripción"
                          />

                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
                            {[
                              { texto: "Activo (visible en el menú)", valor: producto.activo, campo: "activo" as const },
                              { texto: "Destacado", valor: !!producto.destacado, campo: "destacado" as const },
                              { texto: "Más vendido", valor: !!producto.masVendido, campo: "masVendido" as const },
                            ].map((op) => (
                              <label key={op.campo} className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={op.valor}
                                  onChange={(e) => actualizar({ ...producto, [op.campo]: e.target.checked })}
                                  className="h-5 w-5 accent-ember"
                                />
                                {op.texto}
                              </label>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {ETIQUETAS.map((etq) => {
                              const activa = producto.etiquetas?.includes(etq);
                              return (
                                <button
                                  key={etq}
                                  onClick={() => {
                                    const etiquetas = activa
                                      ? (producto.etiquetas || []).filter((e) => e !== etq)
                                      : [...(producto.etiquetas || []), etq];
                                    actualizar({ ...producto, etiquetas });
                                  }}
                                  aria-pressed={!!activa}
                                  className={`h-11 rounded-full border px-4 text-sm font-semibold transition active:scale-95 ${
                                    activa ? "border-ember bg-ember text-white" : "border-cream/25 text-cream/65"
                                  }`}
                                >
                                  {etq}
                                </button>
                              );
                            })}
                          </div>

                          {/* Variantes (proteína/adición) */}
                          <div className="rounded-2xl border-2 border-dashed border-cream/15 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-cream/70">Variantes / adiciones</span>
                              <button
                                onClick={() => agregarVariante(producto)}
                                className="flex min-h-[44px] items-center gap-1.5 px-2 text-sm font-semibold text-mustard-claro"
                              >
                                <Plus size={16} /> Agregar
                              </button>
                            </div>
                            {(producto.variantes || []).length === 0 && (
                              <p className="text-sm text-cream/45">Sin variantes — precio único.</p>
                            )}
                            {(producto.variantes || []).map((v) => (
                              <div key={v.id} className="mb-2 flex items-center gap-2">
                                <input
                                  value={v.nombre}
                                  onChange={(e) => actualizarVariante(producto, v.id, { nombre: e.target.value })}
                                  className={`h-11 min-w-0 flex-1 text-sm ${campo}`}
                                  aria-label="Nombre de la variante"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={v.precio}
                                  onChange={(e) => actualizarVariante(producto, v.id, { precio: Number(e.target.value) })}
                                  className={`h-11 w-24 text-right text-sm tabular-nums ${campo}`}
                                  aria-label="Precio de la variante"
                                />
                                <button
                                  onClick={() => eliminarVariante(producto, v.id)}
                                  aria-label="Quitar variante"
                                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-cream/50 hover:text-ember-claro"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <button
                            onClick={() => eliminar(producto)}
                            aria-label={`Eliminar ${producto.nombre}`}
                            className="grid h-12 w-12 place-items-center rounded-xl border border-cream/15 text-cream/60 transition hover:border-ember hover:text-ember-claro active:scale-95"
                          >
                            <Trash2 size={20} />
                          </button>
                          {guardadoId === producto.id && (
                            <span className="text-xs font-semibold text-olive-claro">Guardado ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => agregarProducto(cat.id)}
                    className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cream/25 text-base font-semibold text-cream/70 transition hover:border-ember hover:text-ember-claro active:scale-[0.99]"
                  >
                    <Plus size={20} /> Agregar producto a {cat.nombre}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
