-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('mesa', 'domicilio', 'recoger');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN "tipoPedido" "TipoPedido" NOT NULL DEFAULT 'mesa';
ALTER TABLE "pedidos" ALTER COLUMN "mesa" DROP NOT NULL;

-- Reclasifica pedidos existentes del "Pedido rápido": antes de este cambio,
-- el tipo de entrega (domicilio/recoger) se guardaba como texto disfrazado
-- en la columna "mesa" (ver PedidoRapidoModal.tsx). Se migran a la nueva
-- columna "tipoPedido" y se limpia "mesa", que ahora solo debe usarse para
-- pedidos de mesa reales.
UPDATE "pedidos" SET "tipoPedido" = 'domicilio', "mesa" = NULL WHERE "mesa" = '🛵 Domicilio';
UPDATE "pedidos" SET "tipoPedido" = 'recoger', "mesa" = NULL WHERE "mesa" = '🏠 Recoger';
