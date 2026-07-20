"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ItemCarrito } from "./types";

interface CartState {
  items: ItemCarrito[];
  mesa: string;
  setMesa: (mesa: string) => void;
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  quitar: (claveUnica: string) => void;
  cambiarCantidad: (claveUnica: string, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      mesa: "",
      setMesa: (mesa) => set({ mesa }),
      agregar: (item, cantidad = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.claveUnica === item.claveUnica);
        const precioSeguro = Number(item.precioUnitario) || 0;
        if (idx >= 0) {
          items[idx] = { ...items[idx], cantidad: items[idx].cantidad + cantidad };
        } else {
          items.push({ ...item, precioUnitario: precioSeguro, cantidad });
        }
        set({ items });
      },
      quitar: (claveUnica) =>
        set({ items: get().items.filter((i) => i.claveUnica !== claveUnica) }),
      cambiarCantidad: (claveUnica, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(claveUnica);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.claveUnica === claveUnica ? { ...i, cantidad } : i
          ),
        });
      },
      vaciar: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (acc, i) => acc + (Number(i.precioUnitario) || 0) * (Number(i.cantidad) || 0),
          0
        ),
      cantidadTotal: () => get().items.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0),
    }),
    {
      name: "carrito-restaurante",
      version: 2,
      migrate: () => ({ items: [], mesa: "" }),
      // Solo el carrito de productos debe sobrevivir un refresco de página.
      // La mesa NUNCA se persiste: si no viene en la URL (?mesa=8) del QR
      // que se acaba de escanear, debe quedar vacía y pedirse en el
      // formulario, para no arrastrar la mesa de una visita anterior.
      partialize: (state) => ({ items: state.items }),
    }
  )
);
