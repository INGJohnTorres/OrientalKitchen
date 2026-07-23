import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import catalogo from "./seed-data.json";

const prisma = new PrismaClient();

async function main() {
  console.log(`Sembrando ${catalogo.categorias.length} categorías y ${catalogo.productos.length} productos...`);

  // Se usan los mismos IDs de slug que en el frontend (lib/menu-data.ts), en
  // vez de dejar que Prisma genere cuids nuevos, para que ambos lados
  // (código estático y base de datos) hablen de los mismos productos.
  for (const cat of catalogo.categorias) {
    await prisma.categoria.upsert({
      where: { id: cat.id },
      update: { nombre: cat.nombre, orden: cat.orden, estiloLista: cat.estiloLista ?? false },
      create: { id: cat.id, nombre: cat.nombre, orden: cat.orden, estiloLista: cat.estiloLista ?? false },
    });
  }

  for (const prod of catalogo.productos) {
    await prisma.producto.upsert({
      where: { id: prod.id },
      update: {
        nombre: prod.nombre,
        descripcion: prod.descripcion ?? "",
        precio: prod.precio,
        imagen: prod.imagen ?? null,
        activo: prod.activo ?? true,
        destacado: prod.destacado ?? false,
        masVendido: prod.masVendido ?? false,
        etiquetas: prod.etiquetas ?? [],
        variantes: prod.variantes ?? undefined,
        categoriaId: prod.categoriaId,
      },
      create: {
        id: prod.id,
        nombre: prod.nombre,
        descripcion: prod.descripcion ?? "",
        precio: prod.precio,
        imagen: prod.imagen ?? null,
        activo: prod.activo ?? true,
        destacado: prod.destacado ?? false,
        masVendido: prod.masVendido ?? false,
        etiquetas: prod.etiquetas ?? [],
        variantes: prod.variantes ?? undefined,
        categoriaId: prod.categoriaId,
      },
    });
  }

  const claveHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.upsert({
    where: { usuario: "admin" },
    update: {},
    create: { usuario: "admin", claveHash, rol: "admin" },
  });

  await prisma.configuracion.upsert({
    where: { id: "config-principal" },
    update: {},
    create: {
      id: "config-principal",
      nombreRestaurante: "Oriental Kitchen",
      numeroWhatsapp: "573115243043",
    },
  });

  console.log("Listo. Usuario admin: admin / admin123 (cámbiala después de la primera entrada).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
