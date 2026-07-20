"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import CartDrawer from "@/components/CartDrawer";
import { obtenerCategorias, obtenerProductos } from "@/lib/api";
import { Categoria, Producto } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";

function MenuContent() {
  const searchParams = useSearchParams();
  const mesaUrl = searchParams.get("mesa");
  const setMesa = useCartStore((s) => s.setMesa);
  const mesaActual = useCartStore((s) => s.mesa);
  const cantidadCarrito = useCartStore((s) => s.cantidadTotal());

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    if (mesaUrl) setMesa(mesaUrl);
  }, [mesaUrl, setMesa]);

  useEffect(() => {
    obtenerCategorias().then((cats) => {
      setCategorias(cats);
      setCategoriaActiva(cats[0]?.id ?? "");
    });
    obtenerProductos().then(setProductos);
  }, []);

  const productosFiltrados = useMemo(() => {
    let lista = productos;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q)
      );
      return lista;
    }
    return lista.filter((p) => p.categoriaId === categoriaActiva);
  }, [productos, busqueda, categoriaActiva]);

  // Las categorías sin foto (ej. Porciones) se muestran como lista de una sola
  // columna, igual que en la carta física, en vez de tarjetas en cuadrícula.
  const listaSinFotos = productosFiltrados.length > 0 && productosFiltrados.every((p) => !p.imagen);

  return (
    <div className="min-h-screen bg-cream pb-28 dark:bg-espresso">
      <div className="sticky top-0 z-40">
        <header className="flex items-center justify-between border-b border-espresso/10 bg-cream/95 px-4 py-3 backdrop-blur dark:border-cream/10 dark:bg-espresso/95">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2 font-display text-sm text-ember">
            <span className="relative h-7 w-7 shrink-0">
              <Image src="/logo-ok.png" alt="" fill className="object-contain" />
            </span>
            ORIENTAL KITCHEN
          </div>
          <button
            onClick={() => setCarritoAbierto(true)}
            aria-label="Ver carrito"
            className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-espresso/10 dark:hover:bg-cream/10"
          >
            <ShoppingBag size={18} />
            {cantidadCarrito > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-ember text-[10px] font-bold text-cream">
                {cantidadCarrito}
              </span>
            )}
          </button>
        </header>

        {!busqueda && (
          <CategoryNav
            categorias={categorias}
            activa={categoriaActiva}
            onSelect={setCategoriaActiva}
          />
        )}
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-full border border-espresso/15 bg-white/60 px-4 py-2.5 dark:border-cream/15 dark:bg-cocoa/50">
          <Search size={16} className="text-espresso/50 dark:text-cream/50" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en el menú..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-espresso/40 dark:placeholder:text-cream/40"
          />
        </div>

        {mesaActual && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mustard/20 px-3 py-1 text-xs font-medium text-ember-dark dark:text-mustard">
            Pedido para mesa {mesaActual}
          </p>
        )}
      </div>

      <section className="px-4 pt-6">
        {busqueda && (
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
            <span className="h-5 w-1.5 rounded-full bg-ember" />
            Resultados para "{busqueda}"
          </h2>
        )}
        <div className={listaSinFotos ? "flex flex-col gap-2" : "grid grid-cols-2 gap-4 sm:grid-cols-3"}>
          {productosFiltrados.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
          {productosFiltrados.length === 0 && (
            <p className="col-span-full py-10 text-center text-espresso/50 dark:text-cream/50">
              No encontramos productos que coincidan.
            </p>
          )}
        </div>
      </section>

      <CartButton onOpen={() => setCarritoAbierto(true)} />
      {carritoAbierto && <CartDrawer onClose={() => setCarritoAbierto(false)} />}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}
