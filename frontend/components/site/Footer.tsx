import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { redes } from "@/lib/social";
import SocialBadge from "./SocialBadge";

export default function Footer() {
  const año = new Date().getFullYear();

  return (
    <footer className="bg-espresso px-5 pb-8 pt-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 border-b border-cream/10 pb-10 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/logo-ok.png" alt="Oriental Kitchen" fill className="object-contain" />
            </div>
            <span className="font-display text-sm text-cream">ORIENTAL KITCHEN</span>
          </div>
          <p className="max-w-xs text-sm text-cream/50">
            Los expertos en arroz. Cocina oriental con alma colombiana.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <span className="font-mono text-xs uppercase tracking-widest text-cream/40">Síguenos</span>
          <div className="flex gap-2">
            <a
              href={redes.whatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="group"
            >
              <SocialBadge claseColor="text-[#25D366]">
                <MessageCircle size={19} strokeWidth={2.2} />
              </SocialBadge>
            </a>
            <a
              href={redes.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Facebook"
              className="group"
            >
              <SocialBadge claseColor="text-[#1877F2]">
                <Facebook size={19} strokeWidth={2.2} />
              </SocialBadge>
            </a>
            <a
              href={redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Instagram"
              className="group"
            >
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="ig-gradiente" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F58529" />
                    <stop offset="50%" stopColor="#DD2A7B" />
                    <stop offset="100%" stopColor="#8134AF" />
                  </linearGradient>
                </defs>
              </svg>
              <SocialBadge gradienteId="ig-gradiente">
                <Instagram size={19} strokeWidth={2.2} />
              </SocialBadge>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="font-mono text-xs uppercase tracking-widest text-cream/40">Ir a</span>
          <Link href="/menu" className="text-sm text-cream/70 transition hover:text-mustard">Menú digital</Link>
          <Link href="#favoritos" className="text-sm text-cream/70 transition hover:text-mustard">Favoritos</Link>
          <Link href="#nosotros" className="text-sm text-cream/70 transition hover:text-mustard">Nosotros</Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-cream/30">
        © {año} Oriental Kitchen — Los expertos en arroz.
      </p>
    </footer>
  );
}
