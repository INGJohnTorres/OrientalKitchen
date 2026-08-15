import clsx from "clsx";

/**
 * Motivo de hojas de bambú en rojo — tomado directamente del arte de tus
 * cartas físicas (el fondo negro con bambú rojo que enmarca cada página del
 * menú impreso). Se usa como acento de marca en la web, en vez de un divisor
 * genérico, para que la página se sienta parte del mismo restaurante.
 */
export default function BambooAccent({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 400"
      className={clsx("pointer-events-none select-none", flip && "-scale-x-100", className)}
      aria-hidden="true"
    >
      <g fill="#D2232A" opacity="0.9">
        <path d="M20 0 L40 90 L15 70 L35 160 L5 145 L28 240 L0 230 L18 320 L-2 400 L45 400 L38 300 L60 240 L42 160 L65 90 L38 40 Z" />
        <path d="M70 60 L95 140 L72 130 L100 220 L75 215 L102 310 L78 400 L118 400 L100 300 L120 220 L98 140 L110 70 Z" opacity="0.55" />
      </g>
    </svg>
  );
}
