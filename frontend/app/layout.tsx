import type { Metadata } from "next";
import { Bungee, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bungee = Bungee({
  subsets: ["latin"],
  variable: "--font-bungee",
  weight: ["400"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Oriental Kitchen — Los expertos en arroz",
  description:
    "Cocina oriental con alma colombiana en Bogotá. Arroz chino, platos especiales, comida rápida y más. Pide en línea o por WhatsApp, para mesa o domicilio.",
  keywords: [
    "Oriental Kitchen",
    "arroz chino Bogotá",
    "comida oriental",
    "restaurante asiático",
    "domicilios comida china",
  ],
  openGraph: {
    title: "Oriental Kitchen — Los expertos en arroz",
    description:
      "Cocina oriental con alma colombiana. Descubre el menú y pide en línea o por WhatsApp.",
    images: ["/panda-chef.png"],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oriental Kitchen — Los expertos en arroz",
    description: "Cocina oriental con alma colombiana. Descubre el menú y pide en línea.",
    images: ["/panda-chef.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`dark ${bungee.variable} ${jakarta.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
