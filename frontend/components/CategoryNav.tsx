"use client";

import clsx from "clsx";
import { Categoria } from "@/lib/types";

export default function CategoryNav({
  categorias,
  activa,
  onSelect,
}: {
  categorias: Categoria[];
  activa: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="-mx-4 border-b border-espresso/10 bg-cream/95 px-4 py-3 backdrop-blur dark:border-cream/10 dark:bg-espresso/95">
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={clsx(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
              activa === c.id
                ? "bg-ember text-cream shadow-md shadow-ember/30"
                : "bg-espresso/5 text-espresso/70 hover:bg-ember/10 dark:bg-cream/8 dark:text-cream/70"
            )}
          >
            {c.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
