"use client";

import { MessageCircle } from "lucide-react";
import { urlWhatsAppMensaje, MENSAJE_CONTACTO_RAPIDO } from "@/lib/social";

export default function WhatsAppFloat() {
  return (
    <a
      href={urlWhatsAppMensaje(MENSAJE_CONTACTO_RAPIDO)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-olive py-3.5 pl-3.5 pr-3.5 text-cream shadow-xl shadow-black/30 transition-all duration-300 hover:pr-5 hover:shadow-2xl sm:bottom-6 sm:right-6"
    >
      <MessageCircle size={24} className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[10rem]">
        Escríbenos
      </span>
    </a>
  );
}
