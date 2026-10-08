"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export default function CartButton({ onOpen }: { onOpen: () => void }) {
  const cantidad = useCartStore((s) => s.cantidadTotal());
  const total = useCartStore((s) => s.total());
  // El carrito guardado en localStorage no existe en el servidor: solo se pinta
  // tras montar para no romper la hidratación.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  if (!montado || cantidad === 0) return null;

  return (
    <button
      onClick={onOpen}
      // Centrada con inset-x + mx-auto (no con -translate-x-1/2): la animación
      // slide-up sobrescribe `transform` y la dejaba corrida a la derecha.
      className="fixed inset-x-4 bottom-5 z-40 mx-auto flex h-14 max-w-md animate-slide-up items-center justify-between rounded-full bg-espresso px-5 text-cream shadow-2xl transition active:scale-[0.98] dark:bg-ember"
    >
      <span className="flex items-center gap-2 font-semibold">
        <ShoppingBag size={18} />
        {cantidad} {cantidad === 1 ? "producto" : "productos"} · Ver pedido
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
