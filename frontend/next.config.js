/** @type {import('next').NextConfig} */
const nextConfig = {
  // Todas las fotos del menú son locales (carpeta /public/productos), por lo
  // que no se necesitan remotePatterns. Si en el futuro subes imágenes a un
  // bucket externo (S3/Cloudinary), agrégalo aquí.
  images: {
    remotePatterns: [],
    // Habilitado para los íconos vectoriales de /productos/bebidas (archivos
    // propios generados localmente, no contenido de usuario).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
