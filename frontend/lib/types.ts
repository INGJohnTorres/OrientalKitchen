export type Etiqueta = "Nuevo" | "Picante" | "Vegetariano" | "Promoción";

/** Una opción de proteína/adición dentro de un plato base (ej: Arroz Personal + Lomo de Cerdo). */
export interface Variante {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
}

export interface Producto {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  /** Precio simple. Si el producto tiene variantes, este es el precio de la opción base. */
  precio: number;
  /** Opcional: si no hay foto (ej. porciones sueltas), la tarjeta se muestra en formato lista. */
  imagen?: string;
  /** Opciones de proteína/adición seleccionables (radio). Cada una reemplaza el precio base. */
  variantes?: Variante[];
  etiquetas?: Etiqueta[];
  destacado?: boolean;
  masVendido?: boolean;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

/** Línea de carrito ya resuelta: nombre y precio finales, listos para mostrar/enviar. */
export interface ItemCarrito {
  claveUnica: string;
  productoId: string;
  nombre: string;
  imagen?: string;
  precioUnitario: number;
  cantidad: number;
}

export type TipoPedido = "mesa" | "domicilio" | "recoger";

export interface DatosCliente {
  nombre: string;
  telefono: string;
  observaciones: string;
  tipoPedido: TipoPedido;
  /** Solo aplica cuando tipoPedido === "mesa". */
  mesa?: string;
}

/** Datos del "Pedido rápido" que se arma desde la página principal (sin mesa). */
export interface DatosPedidoRapido {
  nombre: string;
  telefono: string;
  tipoEntrega: "domicilio" | "recoger";
  /** Punto marcado en el mapa (solo para domicilio). */
  ubicacion?: { lat: number; lng: number; direccion: string };
  /** Detalles extra de la dirección (apto, torre, indicaciones) — opcional. */
  detalleDireccion?: string;
  /** Método elegido para pagar (solo para "recoger"). "efectivo" se paga al recoger, sin adelanto. */
  metodoPago?: "nequi" | "daviplata" | "efectivo";
  pagoConfirmado?: boolean;
  observaciones?: string;
}

export type EstadoPedido =
  | "nuevo"
  | "aceptado"
  | "preparando"
  | "listo"
  | "entregado"
  | "cancelado";

export interface Pedido {
  id: string;
  numero: number;
  tipoPedido: TipoPedido;
  mesa?: string | null;
  cliente: string;
  telefono?: string;
  observaciones: string;
  items: ItemCarrito[];
  total: number;
  estado: EstadoPedido;
  creadoEn: string;
}

/** Referencia liviana a un pedido, usada en el desglose del dashboard de estadísticas. */
export interface ReferenciaPedido {
  id: string;
  numero: number;
  cliente: string;
  mesa: string | null;
  total: number;
  creadoEn: string;
}

export interface ResumenPorTipo {
  tipoPedido: TipoPedido;
  cantidad: number;
  total: number;
  pedidos: ReferenciaPedido[];
}

export interface ProductoVendido {
  nombre: string;
  cantidad: number;
  total: number;
}

export interface Estadisticas {
  rango: { desde: string; hasta: string };
  totalVentas: number;
  totalPedidos: number;
  porTipo: ResumenPorTipo[];
  productos: ProductoVendido[];
}

/** basico = solo menú digital, medio = suma pedidos por WhatsApp, premium = suma el dashboard de estadísticas. */
export type PlanNegocio = "basico" | "medio" | "premium";

export interface Configuracion {
  id: string;
  nombreRestaurante: string;
  logoUrl?: string | null;
  numeroWhatsapp: string;
  correoNotificacion?: string | null;
  plan: PlanNegocio;
}

export interface UsuarioSesion {
  id: string;
  usuario: string;
  rol: string;
}
