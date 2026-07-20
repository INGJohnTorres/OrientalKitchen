"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export default function CartButton({ onOpen }: { onOpen: () => void }) {
  const cantidad = useCartStore((s) => s.cantidadTotal());
  const total = useCartStore((s) => s.total());

  if (cantidad === 0) return null;

  return (
    <button
      onClick={onOpen}
      className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-slide-up items-center justify-between rounded-full bg-espresso px-5 py-3.5 text-cream shadow-2xl transition hover:scale-[1.02] dark:bg-ember"
    >
      <span className="flex items-center gap-2 font-semibold">
        <ShoppingBag size={18} />
        {cantidad} {cantidad === 1 ? "producto" : "productos"}
      </span>
      <span className="font-mono text-sm">
        {total.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        })}
      </span>
    </button>
  );
}
