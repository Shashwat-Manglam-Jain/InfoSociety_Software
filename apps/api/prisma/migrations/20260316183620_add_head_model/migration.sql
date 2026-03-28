-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "headId" TEXT;

-- CreateTable
CREATE TABLE "Head" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,

    CONSTRAINT "Head_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Head_code_key" ON "Head"("code");

-- CreateIndex
CREATE INDEX "Head_group_idx" ON "Head"("group");

-- CreateIndex
CREATE INDEX "Head_relatedType_idx" ON "Head"("relatedType");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Head"("id") ON DELETE SET NULL ON UPDATE CASCADE;
