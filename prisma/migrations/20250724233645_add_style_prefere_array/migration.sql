/*
  Warnings:

  - The `stylePrefere` column on the `FormResponse` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "stylePrefere",
ADD COLUMN     "stylePrefere" TEXT[];
