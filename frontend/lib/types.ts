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

export interface DatosCliente {
  nombre: string;
  mesa: string;
  observaciones: string;
  telefono?: string;
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
  mesa: string;
  cliente: string;
  telefono?: string;
  observaciones: string;
  items: ItemCarrito[];
  total: number;
  estado: EstadoPedido;
  creadoEn: string;
}
