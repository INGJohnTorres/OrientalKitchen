import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { redes } from "@/lib/social";

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
          <div className="flex gap-3">
            <a
              href={redes.whatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-full bg-cream/5 text-cream transition hover:-translate-y-1 hover:bg-olive"
            >
              <MessageCircle size={19} />
            </a>
            <a
              href={redes.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Facebook"
              className="grid h-11 w-11 place-items-center rounded-full bg-cream/5 text-cream transition hover:-translate-y-1 hover:bg-[#1877F2]"
            >
              <Facebook size={19} />
            </a>
            <a
              href={redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Instagram"
              className="grid h-11 w-11 place-items-center rounded-full bg-cream/5 text-cream transition hover:-translate-y-1 hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]"
            >
              <Instagram size={19} />
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
