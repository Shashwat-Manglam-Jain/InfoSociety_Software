-- AlterTable
ALTER TABLE "User"
ADD COLUMN "allowedModuleSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
