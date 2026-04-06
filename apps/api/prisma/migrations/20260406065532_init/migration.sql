/*
  Warnings:

  - You are about to drop the `Director` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Director" DROP CONSTRAINT "Director_societyId_fkey";

-- DropTable
DROP TABLE "Director";
