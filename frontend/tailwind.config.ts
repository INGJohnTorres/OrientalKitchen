import type { Config } from "tailwindcss";
import { COLORES } from "./lib/config-restaurante";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: COLORES.cream,
        parchment: COLORES.parchment,
        espresso: COLORES.espresso,
        cocoa: COLORES.cocoa,
        surface: COLORES.surface,
        ember: COLORES.ember,
        "ember-dark": COLORES.emberDark,
        mustard: COLORES.mustard,
        olive: COLORES.olive,
        clay: COLORES.clay,
      },
      fontFamily: {
        display: ["var(--font-bungee)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        ticket: "4px",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pop": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.4s ease-out both",
        "pop": "pop 0.25s ease-out both",
        "drawer-in": "drawer-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(36,23,18,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
export default config;
