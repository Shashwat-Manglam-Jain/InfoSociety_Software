-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "about" TEXT,
ADD COLUMN     "cin" TEXT,
ADD COLUMN     "class" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "softwareUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "requiresPasswordChange" BOOLEAN NOT NULL DEFAULT false;
