import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F1E6",
        parchment: "#E9E4D6",
        espresso: "#121214",
        cocoa: "#1C1B1F",
        surface: "#232227",
        ember: "#D2232A",
        "ember-dark": "#9C161B",
        mustard: "#D9A441",
        olive: "#2F7A5C",
        clay: "#3A3A3E",
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
