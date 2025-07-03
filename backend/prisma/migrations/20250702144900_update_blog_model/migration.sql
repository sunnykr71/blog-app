/*
  Warnings:

  - You are about to drop the column `metaDescription` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `Blog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle",
ADD COLUMN     "description" TEXT;
