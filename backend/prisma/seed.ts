import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const entradas = await prisma.categoria.create({ data: { nombre: "Entradas", orden: 1 } });
  const hamburguesas = await prisma.categoria.create({ data: { nombre: "Hamburguesas", orden: 2 } });
  const pizzas = await prisma.categoria.create({ data: { nombre: "Pizzas", orden: 3 } });
  const bebidas = await prisma.categoria.create({ data: { nombre: "Bebidas", orden: 4 } });
  const postres = await prisma.categoria.create({ data: { nombre: "Postres", orden: 5 } });

  await prisma.producto.createMany({
    data: [
      {
        nombre: "Alitas BBQ",
        descripcion: "8 alitas bañadas en salsa BBQ ahumada.",
        precio: 24000,
        imagen: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&q=80",
        categoriaId: entradas.id,
        etiquetas: ["Picante"],
      },
      {
        nombre: "Clásica",
        descripcion: "Carne 150g, queso cheddar, lechuga, tomate y salsa especial.",
        precio: 26000,
        imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
        categoriaId: hamburguesas.id,
        masVendido: true,
      },
      {
        nombre: "Margarita",
        descripcion: "Salsa de tomate, mozzarella fresca y albahaca.",
        precio: 34000,
        imagen: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
        categoriaId: pizzas.id,
        etiquetas: ["Vegetariano"],
      },
      {
        nombre: "Coca-Cola 400ml",
        descripcion: "Bien fría.",
        precio: 6000,
        imagen: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
        categoriaId: bebidas.id,
      },
      {
        nombre: "Volcán de chocolate",
        descripcion: "Con centro líquido y helado de vainilla.",
        precio: 15000,
        imagen: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80",
        categoriaId: postres.id,
        destacado: true,
      },
    ],
  });

  const claveHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.create({
    data: { usuario: "admin", claveHash, rol: "admin" },
  });

  await prisma.configuracion.create({
    data: {
      nombreRestaurante: "Oriental Kitchen",
      numeroWhatsapp: "573115243043",
    },
  });

  console.log("Seed completado. Usuario admin: admin / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
