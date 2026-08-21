import { categorias as categoriasBase, productos as productosBase } from "./menu-data";
import {
  Categoria,
  Configuracion,
  DatosCliente,
  Estadisticas,
  ItemCarrito,
  Pedido,
  PlanNegocio,
  ProductoVendido,
  Producto,
  ResumenPorTipo,
  TipoPedido,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CLAVE_CATALOGO = "catalogo-restaurante";
const CLAVE_TOKEN = "admin-token";
const CLAVE_ROL = "admin-rol";
const CLAVE_CONFIGURACION = "configuracion-restaurante";

/**
 * ============================================================================
 * DOS MODOS DE FUNCIONAMIENTO
 * ============================================================================
 * MODO DEMO (por defecto, sin backend): todo vive en el localStorage del
 * navegador. Sirve para probar la app sin desplegar nada, pero cada
 * dispositivo tiene su propia copia — un cliente que escanea el QR no ve los
 * cambios que hagas en el editor de productos desde tu celular.
 *
 * MODO BACKEND (cuando defines NEXT_PUBLIC_API_URL en .env.local o en
 * Vercel): todas estas funciones hablan con la API real (backend/), que
 * guarda todo en Postgres. Ahí sí, todos los dispositivos ven lo mismo.
 *
 * Para activar el modo backend: despliega `backend/` (Railway/Render, ver
 * README) y define NEXT_PUBLIC_API_URL=https://tu-backend.com/api. No hay
 * que tocar ningún otro archivo — este switch es automático.
 * ============================================================================
 */
export function modoBackend(): boolean {
  return !!API_URL;
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLAVE_TOKEN);
}

function headersAuth(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...extra,
  };
}

// ---------- Autenticación del panel admin ----------

/**
 * En modo backend, llama a POST /auth/login y guarda el JWT devuelto.
 * En modo demo, usa el usuario/clave fijos (admin / admin123) sin backend.
 */
export async function iniciarSesion(usuario: string, clave: string): Promise<boolean> {
  if (!modoBackend()) {
    // El superadmin también existe en modo demo, para poder probar
    // /admin/superadmin sin backend conectado.
    if (usuario === "superadmin" && clave === "superadmin123") {
      localStorage.setItem(CLAVE_ROL, "superadmin");
      return true;
    }
    if (usuario === "admin" && clave === "admin123") {
      localStorage.setItem(CLAVE_ROL, "admin");
      return true;
    }
    return false;
  }
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, clave }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem(CLAVE_TOKEN, data.token);
    localStorage.setItem(CLAVE_ROL, data.usuario.rol);
    return true;
  } catch (err) {
    console.error("Error al iniciar sesión contra el backend:", err);
    return false;
  }
}

/** Rol de la sesión activa ("admin" | "superadmin"), o null si no hay sesión. */
export function rolActual(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CLAVE_ROL);
}

export function cerrarSesion(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_ROL);
}

/**
 * Cambia la contraseña del admin. Solo funciona en modo backend (necesita un
 * usuario real en Postgres para poder verificar la clave actual y guardarla).
 */
export async function cambiarClave(
  claveActual: string,
  claveNueva: string
): Promise<{ ok: boolean; error?: string }> {
  if (!modoBackend()) {
    return {
      ok: false,
      error: "Cambiar la contraseña requiere el backend conectado (ver NEXT_PUBLIC_API_URL).",
    };
  }
  try {
    const res = await fetch(`${API_URL}/auth/clave`, {
      method: "PATCH",
      headers: headersAuth(),
      body: JSON.stringify({ claveActual, claveNueva }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || "No se pudo cambiar la contraseña." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

// ---------- Catálogo (modo demo: localStorage) ----------

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

function guardarCatalogoLocal(catalogo: Catalogo) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(catalogo));
}

// ---------- Lectura para el menú del cliente ----------

export async function obtenerCategorias(): Promise<Categoria[]> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/categorias`);
    if (!res.ok) throw new Error("No se pudieron cargar las categorías.");
    return res.json();
  }
  return leerCatalogo().categorias;
}

export async function obtenerProductos(): Promise<Producto[]> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error("No se pudieron cargar los productos.");
    return res.json();
  }
  return leerCatalogo().productos.filter((p) => p.activo);
}

// ---------- Lectura/escritura para el editor de productos (admin) ----------

/** Igual que obtenerProductos(), pero incluye los inactivos (para poder reactivarlos). */
export async function obtenerProductosAdmin(): Promise<Producto[]> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/productos/todos`, { headers: headersAuth() });
    if (!res.ok) throw new Error("No se pudieron cargar los productos (¿sesión vencida?).");
    return res.json();
  }
  return leerCatalogo().productos;
}

export async function guardarProducto(producto: Producto): Promise<void> {
  if (modoBackend()) {
    // Se intenta actualizar primero; si el producto todavía no existe en la
    // base de datos (recién creado en el editor), el backend responde 404 y
    // se crea con ese mismo id para que quede estable.
    const resPut = await fetch(`${API_URL}/productos/${producto.id}`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify(producto),
    });
    if (resPut.status === 404) {
      const resPost = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: headersAuth(),
        body: JSON.stringify(producto),
      });
      if (!resPost.ok) throw new Error("No se pudo crear el producto.");
      return;
    }
    if (!resPut.ok) throw new Error("No se pudo guardar el producto.");
    return;
  }

  const catalogo = leerCatalogo();
  const idx = catalogo.productos.findIndex((p) => p.id === producto.id);
  if (idx >= 0) {
    catalogo.productos[idx] = producto;
  } else {
    catalogo.productos.push(producto);
  }
  guardarCatalogoLocal(catalogo);
}

export async function eliminarProducto(id: string): Promise<void> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/productos/${id}`, { method: "DELETE", headers: headersAuth() });
    if (!res.ok) throw new Error("No se pudo eliminar el producto.");
    return;
  }
  const catalogo = leerCatalogo();
  catalogo.productos = catalogo.productos.filter((p) => p.id !== id);
  guardarCatalogoLocal(catalogo);
}

/** Borra los cambios locales y vuelve al catálogo original definido en el código (solo modo demo). */
export function restablecerCatalogo(): void {
  if (modoBackend()) {
    console.warn("restablecerCatalogo() no aplica en modo backend: tus datos viven en Postgres, no en este navegador.");
    return;
  }
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLAVE_CATALOGO);
}

/** Genera un JSON descargable con el catálogo actual, para respaldo o para enviarlo a tu desarrollador. */
export async function exportarCatalogoJSON(): Promise<string> {
  if (modoBackend()) {
    const [categorias, productos] = await Promise.all([obtenerCategorias(), obtenerProductosAdmin()]);
    return JSON.stringify({ categorias, productos }, null, 2);
  }
  return JSON.stringify(leerCatalogo(), null, 2);
}

// ---------- Pedidos ----------

export async function crearPedido(
  cliente: DatosCliente,
  items: ItemCarrito[],
  total: number
): Promise<Pedido> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoPedido: cliente.tipoPedido,
        mesa: cliente.mesa,
        cliente: cliente.nombre,
        telefono: cliente.telefono,
        observaciones: cliente.observaciones,
        items,
        total,
      }),
    });
    if (!res.ok) throw new Error("No se pudo registrar el pedido en el servidor.");
    return res.json();
  }

  const pedido: Pedido = {
    id: crypto.randomUUID(),
    numero: Math.floor(Math.random() * 9000) + 1000,
    tipoPedido: cliente.tipoPedido,
    mesa: cliente.mesa,
    cliente: cliente.nombre,
    telefono: cliente.telefono,
    observaciones: cliente.observaciones,
    items,
    total,
    estado: "nuevo",
    creadoEn: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const existentes: Pedido[] = JSON.parse(localStorage.getItem("pedidos-restaurante") || "[]");
    localStorage.setItem("pedidos-restaurante", JSON.stringify([pedido, ...existentes]));
  }

  return pedido;
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/pedidos`, { headers: headersAuth() });
    if (!res.ok) throw new Error("No se pudieron cargar los pedidos (¿sesión vencida?).");
    return res.json();
  }
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("pedidos-restaurante") || "[]");
}

/** Ventas y pedidos por tipo/producto en un rango de fechas (máximo 31 días), para el dashboard. */
export async function obtenerEstadisticas(desde: string, hasta: string): Promise<Estadisticas> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/pedidos/estadisticas?desde=${desde}&hasta=${hasta}`, {
      headers: headersAuth(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "No se pudieron cargar las estadísticas.");
    }
    return res.json();
  }

  // Modo demo: se calcula lo mismo en el navegador a partir de localStorage,
  // para que el dashboard funcione igual sin backend conectado.
  const pedidos: Pedido[] =
    typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("pedidos-restaurante") || "[]");

  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T23:59:59.999`);
  const enRango = pedidos.filter((p) => {
    const fecha = new Date(p.creadoEn);
    return fecha >= inicio && fecha <= fin && p.estado !== "cancelado";
  });

  const tipos: TipoPedido[] = ["mesa", "domicilio", "recoger"];
  const porTipoMap = Object.fromEntries(
    tipos.map((t) => [t, { tipoPedido: t, cantidad: 0, total: 0, pedidos: [] } as ResumenPorTipo])
  ) as Record<TipoPedido, ResumenPorTipo>;
  const productosMap: Record<string, ProductoVendido> = {};
  let totalVentas = 0;

  for (const p of enRango) {
    const grupo = porTipoMap[p.tipoPedido] ?? porTipoMap.mesa;
    grupo.cantidad += 1;
    grupo.total += p.total;
    grupo.pedidos.push({
      id: p.id,
      numero: p.numero,
      cliente: p.cliente,
      mesa: p.mesa ?? null,
      total: p.total,
      creadoEn: p.creadoEn,
    });
    totalVentas += p.total;
    for (const item of p.items) {
      if (!productosMap[item.nombre]) productosMap[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
      productosMap[item.nombre].cantidad += item.cantidad;
      productosMap[item.nombre].total += item.cantidad * item.precioUnitario;
    }
  }

  return {
    rango: { desde, hasta },
    totalVentas,
    totalPedidos: enRango.length,
    porTipo: Object.values(porTipoMap),
    productos: Object.values(productosMap).sort((a, b) => b.cantidad - a.cantidad),
  };
}

export async function actualizarEstadoPedido(id: string, estado: Pedido["estado"]): Promise<void> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: headersAuth(),
      body: JSON.stringify({ estado }),
    });
    if (!res.ok) throw new Error("No se pudo actualizar el estado del pedido.");
    return;
  }
  if (typeof window === "undefined") return;
  const pedidos: Pedido[] = JSON.parse(localStorage.getItem("pedidos-restaurante") || "[]");
  const actualizados = pedidos.map((p) => (p.id === id ? { ...p, estado } : p));
  localStorage.setItem("pedidos-restaurante", JSON.stringify(actualizados));
}

/** Borra un pedido (ej. mal digitado por error). Acción irreversible. */
export async function eliminarPedido(id: string): Promise<void> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/pedidos/${id}`, {
      method: "DELETE",
      headers: headersAuth(),
    });
    if (!res.ok) throw new Error("No se pudo borrar el pedido.");
    return;
  }
  if (typeof window === "undefined") return;
  const pedidos: Pedido[] = JSON.parse(localStorage.getItem("pedidos-restaurante") || "[]");
  localStorage.setItem("pedidos-restaurante", JSON.stringify(pedidos.filter((p) => p.id !== id)));
}

// ---------- Configuración del negocio (plan basico/medio/premium) ----------

const CONFIG_DEMO_POR_DEFECTO: Configuracion = {
  id: "config-principal",
  nombreRestaurante: "Oriental Kitchen",
  numeroWhatsapp: "573115243043",
  plan: "premium",
};

// Cache en memoria: varios componentes (Hero, CTAFinal, WhatsAppFloat, el
// dashboard) preguntan el plan actual en la misma carga de página. Evita
// pedirlo una vez por componente; se limpia al cambiar el plan.
let cacheConfiguracion: Promise<Configuracion> | null = null;

export function refrescarCacheConfiguracion(): void {
  cacheConfiguracion = null;
}

export function obtenerConfiguracion(): Promise<Configuracion> {
  if (cacheConfiguracion) return cacheConfiguracion;

  cacheConfiguracion = (async () => {
    if (modoBackend()) {
      const res = await fetch(`${API_URL}/configuracion`);
      if (!res.ok) throw new Error("No se pudo cargar la configuración del negocio.");
      return res.json();
    }
    if (typeof window === "undefined") return CONFIG_DEMO_POR_DEFECTO;
    const guardado = localStorage.getItem(CLAVE_CONFIGURACION);
    if (!guardado) return CONFIG_DEMO_POR_DEFECTO;
    try {
      return { ...CONFIG_DEMO_POR_DEFECTO, ...JSON.parse(guardado) };
    } catch {
      return CONFIG_DEMO_POR_DEFECTO;
    }
  })();

  return cacheConfiguracion;
}

/** Solo el superadmin puede llamar esto. */
export async function actualizarPlan(plan: PlanNegocio): Promise<void> {
  if (modoBackend()) {
    const res = await fetch(`${API_URL}/configuracion`, {
      method: "PATCH",
      headers: headersAuth(),
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "No se pudo actualizar el plan.");
    }
  } else if (typeof window !== "undefined") {
    const actual = await obtenerConfiguracion();
    localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify({ ...actual, plan }));
  }
  refrescarCacheConfiguracion();
}
