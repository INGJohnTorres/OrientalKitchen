"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { usePlan, permitePedidos } from "@/lib/plan";
import BambooAccent from "./BambooAccent";

export default function Hero() {
  const [listo, setListo] = useState(false);
  const abrirPedidoRapido = useCartStore((s) => s.abrirPedidoRapido);
  const plan = usePlan();
  const puedePedir = plan === null || permitePedidos(plan);
  useEffect(() => setListo(true), []);

  return (
    <section id="inicio" className="relative flex min-h-[100svh] scroll-mt-20 items-center overflow-hidden bg-espresso">
      <Image
        src="/productos/arroz-paisa.jpg"
        alt="Arroz Super Paisa de Oriental Kitchen, recién salteado con vegetales, chorizo y cerdo ahumado"
        fill
        priority
        className={`object-cover transition-transform duration-[3000ms] ease-out ${listo ? "scale-100" : "scale-110"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/75 to-espresso/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/70 via-transparent to-espresso/30" />

      <BambooAccent className="absolute -left-4 top-0 h-full w-24 opacity-70 sm:w-32" />
      <BambooAccent flip className="absolute -right-4 top-0 h-full w-24 opacity-70 sm:w-32" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-10 text-center">
        <div
          className={`relative mx-auto mb-2 flex items-center justify-center transition-all duration-700 ${
            listo ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="absolute h-28 w-28 rounded-full bg-mustard/25 blur-2xl sm:h-40 sm:w-40" />
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 lg:h-52 lg:w-52">
            <Image
              src="/panda-chef.png"
              alt="Panda chef, mascota de Oriental Kitchen"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <h1
          className={`font-display text-4xl leading-[1.1] tracking-tight text-cream drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)] transition-all delay-100 duration-700 sm:text-6xl ${
            listo ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Sabores que se disfrutan,
          <br />
          <span className="text-ember">momentos que se recuerdan.</span>
        </h1>

        <p
          className={`mx-auto mt-5 max-w-xl text-base text-cream/80 transition-all delay-200 duration-700 sm:text-lg ${
            listo ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Los expertos en arroz. Cocina oriental con alma colombiana — ingredientes frescos,
          preparación al momento, y el sabor que te hace volver.
        </p>

        <div
          className={`mt-8 flex flex-col items-center justify-center gap-3 transition-all delay-300 duration-700 sm:flex-row ${
            listo ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Link
            href="/menu"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ember px-8 py-4 text-base font-semibold text-cream shadow-lg shadow-ember/30 transition hover:scale-105 hover:bg-ember-dark sm:w-auto"
          >
            <ShoppingBag size={19} /> Ver nuestro menú
          </Link>
          {puedePedir && (
            <button
              onClick={abrirPedidoRapido}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-mustard px-8 py-4 text-base font-semibold text-mustard transition hover:scale-105 hover:bg-mustard hover:text-espresso sm:w-auto"
            >
              <MessageCircle size={19} /> Pedir por WhatsApp
            </button>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <div className="h-9 w-5 rounded-full border-2 border-cream/40">
          <div className="mx-auto mt-1.5 h-1.5 w-1 animate-bounce rounded-full bg-cream/60" />
        </div>
      </div>
    </section>
  );
}
