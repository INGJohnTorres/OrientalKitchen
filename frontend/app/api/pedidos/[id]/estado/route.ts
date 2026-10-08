import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requiereAuth } from "@/lib/server/auth";
import { HttpError, json, leerJson, manejar } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const estadoSchema = z.object({
  estado: z.enum(["nuevo", "aceptado", "preparando", "listo", "entregado", "cancelado"]),
});

// PATCH /api/pedidos/:id/estado — admin/cocina, cambia el estado del pedido
export const PATCH = manejar(async (req: Request, { params }: { params: { id: string } }) => {
  requiereAuth(req);

  const parsed = estadoSchema.safeParse(await leerJson(req));
  if (!parsed.success) throw new HttpError(400, { error: parsed.error.flatten() });

  const pedido = await prisma.pedido.update({
    where: { id: params.id },
    data: { estado: parsed.data.estado },
  });
  return json(pedido);
});
