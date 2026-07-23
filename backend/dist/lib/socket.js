"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializarSocket = inicializarSocket;
/**
 * Punto de extensión para notificaciones en tiempo real.
 *
 * Para activarlo:
 *   npm install socket.io
 *   import { Server as SocketServer } from "socket.io";
 *   const io = new SocketServer(httpServer, { cors: { origin: process.env.CORS_ORIGIN } });
 *   export function notificarNuevoPedido(pedido) { io.emit("pedido:nuevo", pedido); }
 *
 * Y en el frontend (panel admin), conectarse con socket.io-client y escuchar
 * el evento "pedido:nuevo" para actualizar la lista sin recargar ni hacer polling.
 */
function inicializarSocket(_httpServer) {
    // Intencionalmente vacío: activar cuando se agregue socket.io como dependencia.
}
