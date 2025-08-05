/*
  Warnings:

  - You are about to drop the column `eReputation` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `rgpd` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `sauvegardes` on the `FormResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "eReputation",
DROP COLUMN "rgpd",
DROP COLUMN "sauvegardes",
ADD COLUMN     "gestionEReputation" TEXT,
ADD COLUMN     "respectRGPD" TEXT,
ADD COLUMN     "sauvegardesAuto" TEXT;
