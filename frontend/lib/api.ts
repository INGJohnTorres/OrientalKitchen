import { categorias as categoriasBase, productos as productosBase } from "./menu-data";
import { Categoria, DatosCliente, ItemCarrito, Pedido, Producto } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CLAVE_CATALOGO = "catalogo-restaurante";

/**
 * ============================================================================
 * IMPORTANTE — LIMITACIÓN ACTUAL (léelo antes de usar el editor de productos)
 * ============================================================================
 * Como todavía no hay un backend/base de datos real conectado, el catálogo
 * editable vive en el localStorage del NAVEGADOR donde lo edites. Eso quiere
 * decir que los cambios que hagas en /admin/productos:
 *   - SÍ se guardan y sobreviven si cierras y vuelves a abrir ese navegador.
 *   - NO se ven automáticamente en el celular de un cliente que escanea el QR,
 *     porque ese es OTRO navegador/dispositivo con su propio localStorage.
 *
 * Por eso el editor incluye un botón "Exportar catálogo": genera un archivo
 * que puedes enviarme (o a quien mantenga el código) para actualizar
 * `menu-data.ts` y que el cambio sea permanente y visible para todos.
 *
 * TODO: conectar backend — cuando `backend/` esté desplegado, estas funciones
 * deben reemplazarse por fetch() a la API real (ver comentarios abajo), y
 * ese problema desaparece: todos verían los mismos datos, en vivo.
 * ============================================================================
 */

interface Catalogo {
  categorias: Categoria[];
  productos: Producto[];
}

function leerCatalogo(): Catalogo {
  if (typeof window === "undefined") {
    return { categorias: categoriasBase, productos: productosBase };
  }
  const guardado = localStorage.getItem(CLAVE_CATALOGO);
  if (!guardado) {
    // Primera vez: se siembra con el catálogo del código (menu-data.ts).
    const inicial = { categorias: categoriasBase, productos: productosBase };
    localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(inicial));
    return inicial;
  }
  try {
    return JSON.parse(guardado);
  } catch {
    return { categorias: categoriasBase, productos: productosBase };
  }
}

function guardarCatalogo(catalogo: Catalogo) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(catalogo));
}

// ---------- Lectura para el menú del cliente ----------

export async function obtenerCategorias(): Promise<Categoria[]> {
  // TODO: conectar backend — const res = await fetch(`${API_URL}/categorias`); return res.json();
  return leerCatalogo().categorias;
}

export async function obtenerProductos(): Promise<Producto[]> {
  // TODO: conectar backend — const res = await fetch(`${API_URL}/productos`); return res.json();
  return leerCatalogo().productos.filter((p) => p.activo);
}

// ---------- Lectura/escritura para el panel de administración ----------

/** Igual que obtenerProductos(), pero incluye los inactivos (para poder reactivarlos). */
export async function obtenerProductosAdmin(): Promise<Producto[]> {
  return leerCatalogo().productos;
}

export async function guardarProducto(producto: Producto): Promise<void> {
  // TODO: conectar backend — PUT/POST a `${API_URL}/productos/${producto.id}`
  const catalogo = leerCatalogo();
  const idx = catalogo.productos.findIndex((p) => p.id === producto.id);
  if (idx >= 0) {
    catalogo.productos[idx] = producto;
  } else {
    catalogo.productos.push(producto);
  }
  guardarCatalogo(catalogo);
}

export async function eliminarProducto(id: string): Promise<void> {
  // TODO: conectar backend — DELETE a `${API_URL}/productos/${id}`
  const catalogo = leerCatalogo();
  catalogo.productos = catalogo.productos.filter((p) => p.id !== id);
  guardarCatalogo(catalogo);
}

/** Borra los cambios locales y vuelve al catálogo original definido en el código. */
export function restablecerCatalogo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLAVE_CATALOGO);
}

/** Genera un JSON descargable con el catálogo actual, para enviarlo a tu desarrollador. */
export function exportarCatalogoJSON(): string {
  const catalogo = leerCatalogo();
  return JSON.stringify(catalogo, null, 2);
}

// ---------- Pedidos (sin cambios) ----------

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
