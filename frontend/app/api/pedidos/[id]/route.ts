import { prisma } from "@/lib/server/prisma";
import { requiereAuth } from "@/lib/server/auth";
import { HttpError, manejar, sinContenido } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/pedidos/:id — admin, borra un pedido mal digitado (ej. mesa
// equivocada, pedido de prueba). Cascada automática sobre DetallePedido.
export const DELETE = manejar(async (req: Request, { params }: { params: { id: string } }) => {
  requiereAuth(req);

  const { count } = await prisma.pedido.deleteMany({ where: { id: params.id } });
  if (count === 0) throw new HttpError(404, "Pedido no encontrado.");
  return sinContenido();
});
