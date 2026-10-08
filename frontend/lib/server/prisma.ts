import { PrismaClient } from "@prisma/client";

// En desarrollo, Next recarga los modulos en caliente; sin esto se abriria un
// cliente (y sus conexiones) nuevo en cada recarga.
const global_ = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = global_.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global_.prisma = prisma;
