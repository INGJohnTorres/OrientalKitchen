import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 NO reenvía automáticamente los errores lanzados dentro de un
 * handler async al middleware de errores — si no se envuelve, la petición
 * se queda colgada (unhandled rejection) en vez de responder con un 500
 * limpio. Este wrapper atrapa cualquier rechazo y lo manda a next(err).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
