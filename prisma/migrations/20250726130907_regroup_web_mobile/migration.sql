/*
  Warnings:

  - You are about to drop the column `appAndroid` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `appIos` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `notifications` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `responsive` on the `FormResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "appAndroid",
DROP COLUMN "appIos",
DROP COLUMN "logo",
DROP COLUMN "notifications",
DROP COLUMN "responsive",
ADD COLUMN     "webMobile" TEXT[];
