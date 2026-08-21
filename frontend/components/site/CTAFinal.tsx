"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { usePlan, permitePedidos } from "@/lib/plan";
import Reveal from "./Reveal";
import BambooAccent from "./BambooAccent";

export default function CTAFinal() {
  const abrirPedidoRapido = useCartStore((s) => s.abrirPedidoRapido);
  const plan = usePlan();
  const puedePedir = plan === null || permitePedidos(plan);

  return (
    <section id="contacto" className="relative scroll-mt-20 overflow-hidden bg-ember px-5 py-20 sm:py-28">
      <BambooAccent className="absolute -left-6 top-0 h-full w-28 opacity-25 mix-blend-multiply sm:w-40" />
      <BambooAccent flip className="absolute -right-6 top-0 h-full w-28 opacity-25 mix-blend-multiply sm:w-40" />

      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="relative h-16 w-16">
          <Image src="/panda-mascot.png" alt="" fill className="object-contain drop-shadow-lg" />
        </div>
        <h2 className="font-display text-3xl leading-tight text-cream drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)] sm:text-4xl">
          ¿Ya sabes qué vas a pedir?
        </h2>
        <p className="max-w-md text-cream/90">
          Descubre nuestros platos y disfruta de tu próximo favorito.
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-8 py-4 text-base font-semibold text-cream shadow-lg transition hover:scale-105 sm:w-auto"
          >
            Ver menú 🍽️
          </Link>
          {puedePedir && (
            <button
              onClick={abrirPedidoRapido}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-cream px-8 py-4 text-base font-semibold text-cream transition hover:scale-105 hover:bg-cream hover:text-ember sm:w-auto"
            >
              <MessageCircle size={19} /> Pedir a domicilio o recoger
            </button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
