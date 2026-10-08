-- CreateEnum
CREATE TYPE "PlanNegocio" AS ENUM ('basico', 'medio', 'premium');

-- AlterTable
ALTER TABLE "configuracion" ADD COLUMN     "plan" "PlanNegocio" NOT NULL DEFAULT 'premium';
