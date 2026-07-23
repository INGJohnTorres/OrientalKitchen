"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
/**
 * Express 4 NO reenvía automáticamente los errores lanzados dentro de un
 * handler async al middleware de errores — si no se envuelve, la petición
 * se queda colgada (unhandled rejection) en vez de responder con un 500
 * limpio. Este wrapper atrapa cualquier rechazo y lo manda a next(err).
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
