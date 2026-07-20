import { categorias, productos } from "./menu-data";
import { Categoria, DatosCliente, ItemCarrito, Pedido, Producto } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Estas funciones hoy devuelven datos de ejemplo (menu-data.ts) para que
 * el frontend funcione de inmediato sin backend.
 *
 * TODO: conectar backend — reemplaza el cuerpo de cada función por un
 * fetch() a la API real, por ejemplo:
 *
 *   export async function obtenerProductos(): Promise<Producto[]> {
 *     const res = await fetch(`${API_URL}/productos`);
 *     return res.json();
 *   }
 */

export async function obtenerCategorias(): Promise<Categoria[]> {
  return categorias;
}

export async function obtenerProductos(): Promise<Producto[]> {
  return productos.filter((p) => p.activo);
}

export async function crearPedido(
  cliente: DatosCliente,
  items: ItemCarrito[],
  total: number
): Promise<Pedido> {
  const pedido: Pedido = {
    id: crypto.randomUUID(),
    numero: Math.floor(Math.random() * 9000) + 1000,
    mesa: cliente.mesa,
    cliente: cliente.nombre,
    telefono: cliente.telefono,
    observaciones: cliente.observaciones,
    items,
    total,
    estado: "nuevo",
    creadoEn: new Date().toISOString(),
  };

  // Demo: guarda en localStorage para que el panel admin lo muestre.
  // TODO: conectar backend — reemplazar por:
  //   await fetch(`${API_URL}/pedidos`, { method: "POST", body: JSON.stringify(pedido) })
  if (typeof window !== "undefined") {
    const existentes: Pedido[] = JSON.parse(
      localStorage.getItem("pedidos-restaurante") || "[]"
    );
    localStorage.setItem(
      "pedidos-restaurante",
      JSON.stringify([pedido, ...existentes])
    );
  }

  return pedido;
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("pedidos-restaurante") || "[]");
}

export async function actualizarEstadoPedido(
  id: string,
  estado: Pedido["estado"]
): Promise<void> {
  if (typeof window === "undefined") return;
  const pedidos: Pedido[] = JSON.parse(
    localStorage.getItem("pedidos-restaurante") || "[]"
  );
  const actualizados = pedidos.map((p) => (p.id === id ? { ...p, estado } : p));
  localStorage.setItem("pedidos-restaurante", JSON.stringify(actualizados));
}
