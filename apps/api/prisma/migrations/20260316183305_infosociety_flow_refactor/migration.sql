-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "branchId" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isHead" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "societyId" TEXT NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fdExtraRate" DECIMAL(5,2),
    "loanExtraRate" DECIMAL(5,2),

    CONSTRAINT "BenefitCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerBenefit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,

    CONSTRAINT "CustomerBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docNumber" TEXT,
    "imageUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Branch_societyId_isActive_idx" ON "Branch"("societyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_societyId_code_key" ON "Branch"("societyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "BenefitCategory_code_key" ON "BenefitCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBenefit_customerId_benefitId_key" ON "CustomerBenefit"("customerId", "benefitId");

-- CreateIndex
CREATE INDEX "KycDocument_customerId_docType_idx" ON "KycDocument"("customerId", "docType");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBenefit" ADD CONSTRAINT "CustomerBenefit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBenefit" ADD CONSTRAINT "CustomerBenefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "BenefitCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
