/*
  Warnings:

  - You are about to drop the `Director` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Director" DROP CONSTRAINT "Director_societyId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "nomineeContactNumber" TEXT,
ADD COLUMN     "nomineeFullName" TEXT,
ADD COLUMN     "nomineeRelation" TEXT,
ADD COLUMN     "panNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- DropTable
DROP TABLE "Director";
