import { ReactNode } from "react";

/**
 * Insignia estilo "salpicón de acuarela" para los íconos de redes sociales —
 * inspirada en el look que pediste (mancha de color con el ícono blanco
 * encima), dibujada desde cero como forma orgánica propia en SVG, no
 * calcada de ninguna imagen de stock.
 */
export default function SocialBadge({
  children,
  claseColor,
  gradienteId,
}: {
  children: ReactNode;
  /** Color de relleno sólido (ignorado si se pasa gradienteId). */
  claseColor?: string;
  /** Id de un <linearGradient> ya definido en <defs> para usar como relleno. */
  gradienteId?: string;
}) {
  return (
    <div className="relative grid h-12 w-12 place-items-center transition duration-300 group-hover:scale-110">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-md">
        <path
          d="M50 6c12 -3 24 4 30 14 6 10 4 21 10 30 6 9 10 20 3 29
             -7 9 -20 10 -31 13 -11 3 -21 9 -32 5
             -11 -4 -17 -15 -21 -26 -4 -11 -6 -23 0 -33
             6 -10 17 -13 24 -21 5 -6 10 -9 17 -11 Z"
          fill={gradienteId ? `url(#${gradienteId})` : "currentColor"}
          className={claseColor}
        />
      </svg>
      <span className="relative z-10 text-white">{children}</span>
    </div>
  );
}
