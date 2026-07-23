"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  ImagePlus,
  AlertTriangle,
} from "lucide-react";
import {
  obtenerCategorias,
  obtenerProductosAdmin,
  guardarProducto,
  eliminarProducto,
  restablecerCatalogo,
  exportarCatalogoJSON,
} from "@/lib/api";
import { comprimirImagen } from "@/lib/image-utils";
import { Categoria, Etiqueta, Producto, Variante } from "@/lib/types";

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

  function descargarExport() {
    const json = exportarCatalogoJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogo-oriental-kitchen.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function restablecer() {
    if (!confirm("Esto borra todos tus cambios locales y vuelve al menú original. ¿Continuar?")) return;
    restablecerCatalogo();
    setCategorias(await obtenerCategorias());
    setProductos(await obtenerProductosAdmin());
  }

  return (
    <main className="min-h-screen bg-parchment pb-24 dark:bg-espresso dark:text-cream">
      <header className="flex items-center justify-between border-b border-espresso/10 bg-white/60 px-6 py-4 dark:border-cream/10 dark:bg-cocoa/40">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-xl font-semibold">Editor de Productos</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={descargarExport}
            className="flex items-center gap-1.5 rounded-full border border-espresso/20 px-3 py-2 text-xs font-medium dark:border-cream/20"
          >
            <Download size={14} /> Exportar catálogo
          </button>
          <button
            onClick={restablecer}
            className="flex items-center gap-1.5 rounded-full border border-espresso/20 px-3 py-2 text-xs font-medium text-ember-dark dark:border-cream/20 dark:text-ember"
          >
            <RotateCcw size={14} /> Restablecer
          </button>
        </div>
      </header>

      <div className="mx-4 mt-4 flex gap-3 rounded-xl border border-mustard/40 bg-mustard/10 p-4 text-sm">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-mustard" />
        <p>
          <strong>Importante:</strong> estos cambios se guardan solo en este navegador. Un cliente que
          escanea el QR desde su celular todavía no los ve — eso requiere conectar el backend. Mientras
          tanto, usa <strong>Exportar catálogo</strong> y envíame ese archivo para hacer el cambio
          permanente para todos.
        </p>
      </div>

      <div className="mx-4 mt-4 flex flex-col gap-3">
        {categorias.map((cat) => {
          const productosCategoria = productos.filter((p) => p.categoriaId === cat.id);
          const abierta = categoriaAbierta === cat.id;
          return (
            <div key={cat.id} className="overflow-hidden rounded-2xl border border-espresso/10 bg-white/50 dark:border-cream/10 dark:bg-cocoa/30">
              <button
                onClick={() => setCategoriaAbierta(abierta ? null : cat.id)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <span className="font-display font-semibold">
                  {cat.nombre} <span className="text-sm font-normal text-espresso/50 dark:text-cream/50">({productosCategoria.length})</span>
                </span>
                {abierta ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {abierta && (
                <div className="flex flex-col gap-3 border-t border-espresso/10 p-4 dark:border-cream/10">
                  {productosCategoria.map((producto) => (
                    <div key={producto.id} className="rounded-xl border border-espresso/10 bg-white/70 p-4 dark:border-cream/10 dark:bg-cocoa/40">
                      <div className="flex gap-3">
                        <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-dashed border-espresso/25 dark:border-cream/25">
                          {producto.imagen ? (
                            <Image src={producto.imagen} alt={producto.nombre} fill className="object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-espresso/30 dark:text-cream/30">
                              <ImagePlus size={20} />
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

                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              value={producto.nombre}
                              onChange={(e) => setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, nombre: e.target.value } : p)))}
                              onBlur={() => actualizar(productos.find((p) => p.id === producto.id)!)}
                              className="flex-1 rounded-lg border border-espresso/20 bg-transparent px-2 py-1.5 font-medium outline-none focus:border-ember dark:border-cream/20"
                              placeholder="Nombre del producto"
                            />
                            <div className="flex items-center gap-1 rounded-lg border border-espresso/20 px-2 dark:border-cream/20">
                              <span className="text-sm text-espresso/50 dark:text-cream/50">$</span>
                              <input
                                type="number"
                                value={producto.precio}
                                onChange={(e) =>
                                  setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, precio: Number(e.target.value) } : p)))
                                }
                                onBlur={() => actualizar(productos.find((p) => p.id === producto.id)!)}
                                className="w-24 bg-transparent py-1.5 text-right font-mono text-sm outline-none"
                              />
                            </div>
                          </div>

                          <textarea
                            value={producto.descripcion}
                            onChange={(e) => setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, descripcion: e.target.value } : p)))}
                            onBlur={() => actualizar(productos.find((p) => p.id === producto.id)!)}
                            rows={2}
                            className="rounded-lg border border-espresso/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ember dark:border-cream/20"
                            placeholder="Descripción"
                          />

                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={producto.activo}
                                onChange={(e) => actualizar({ ...producto, activo: e.target.checked })}
                              />
                              Activo (visible en el menú)
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={!!producto.destacado}
                                onChange={(e) => actualizar({ ...producto, destacado: e.target.checked })}
                              />
                              Destacado
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={!!producto.masVendido}
                                onChange={(e) => actualizar({ ...producto, masVendido: e.target.checked })}
                              />
                              Más vendido
                            </label>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
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
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                    activa ? "border-ember bg-ember text-cream" : "border-espresso/20 text-espresso/50 dark:border-cream/20 dark:text-cream/50"
                                  }`}
                                >
                                  {etq}
                                </button>
                              );
                            })}
                          </div>

                          {/* Variantes (proteína/adición) */}
                          <div className="rounded-lg border border-dashed border-espresso/20 p-2 dark:border-cream/20">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-semibold text-espresso/60 dark:text-cream/60">Variantes / adiciones</span>
                              <button
                                onClick={() => agregarVariante(producto)}
                                className="flex items-center gap-1 text-xs text-ember-dark dark:text-mustard"
                              >
                                <Plus size={12} /> Agregar
                              </button>
                            </div>
                            {(producto.variantes || []).length === 0 && (
                              <p className="text-xs text-espresso/40 dark:text-cream/40">Sin variantes — precio único.</p>
                            )}
                            {(producto.variantes || []).map((v) => (
                              <div key={v.id} className="mb-1 flex items-center gap-2">
                                <input
                                  value={v.nombre}
                                  onChange={(e) => actualizarVariante(producto, v.id, { nombre: e.target.value })}
                                  className="flex-1 rounded border border-espresso/15 bg-transparent px-2 py-1 text-xs outline-none dark:border-cream/15"
                                />
                                <input
                                  type="number"
                                  value={v.precio}
                                  onChange={(e) => actualizarVariante(producto, v.id, { precio: Number(e.target.value) })}
                                  className="w-20 rounded border border-espresso/15 bg-transparent px-2 py-1 text-right font-mono text-xs outline-none dark:border-cream/15"
                                />
                                <button onClick={() => eliminarVariante(producto, v.id)} className="text-espresso/40 hover:text-ember">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end justify-between">
                          <button onClick={() => eliminar(producto)} className="text-espresso/40 hover:text-ember">
                            <Trash2 size={16} />
                          </button>
                          {guardadoId === producto.id && (
                            <span className="text-[10px] font-medium text-olive">Guardado ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => agregarProducto(cat.id)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-espresso/25 py-3 text-sm font-medium text-espresso/60 hover:border-ember hover:text-ember dark:border-cream/25 dark:text-cream/60"
                  >
                    <Plus size={16} /> Agregar producto a {cat.nombre}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
