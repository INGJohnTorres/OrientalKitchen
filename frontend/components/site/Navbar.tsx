"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import clsx from "clsx";

const ENLACES = [
  { href: "#inicio", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "#favoritos", label: "Favoritos" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-espresso/90 shadow-lg shadow-black/30 backdrop-blur-md"
          : "bg-gradient-to-b from-espresso/70 to-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="#inicio" className="flex items-center gap-2">
          <div className="relative h-9 w-9 shrink-0">
            <Image src="/logo-ok.png" alt="Oriental Kitchen" fill className="object-contain" />
          </div>
          <span className="font-display text-sm tracking-wide text-cream sm:text-base">
            ORIENTAL KITCHEN
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-cream/80 transition hover:text-mustard"
            >
              {e.label}
            </Link>
          ))}
          <Link
            href="/menu"
            className="flex items-center gap-1.5 rounded-full bg-ember px-5 py-2 text-sm font-semibold text-cream shadow-md shadow-ember/20 transition hover:scale-105 hover:bg-ember-dark"
          >
            <ShoppingBag size={15} /> Pedir ahora
          </Link>
        </div>

        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="grid h-10 w-10 place-items-center rounded-full text-cream md:hidden"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Panel móvil */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-espresso/98 backdrop-blur transition-opacity duration-300 md:hidden",
          abierto ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/logo-ok.png" alt="Oriental Kitchen" fill className="object-contain" />
            </div>
            <span className="font-display text-sm text-cream">ORIENTAL KITCHEN</span>
          </div>
          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
            className="grid h-10 w-10 place-items-center rounded-full text-cream"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-8 pt-16">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setAbierto(false)}
              className="font-display text-2xl text-cream transition hover:text-mustard"
            >
              {e.label}
            </Link>
          ))}
          <Link
            href="/menu"
            onClick={() => setAbierto(false)}
            className="mt-4 flex items-center gap-2 rounded-full bg-ember px-8 py-3.5 text-base font-semibold text-cream shadow-lg shadow-ember/30"
          >
            <ShoppingBag size={18} /> Pedir ahora
          </Link>
        </div>
      </div>
    </header>
  );
}
