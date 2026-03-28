-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "pigmyAgentId" TEXT;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactNo" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "ifscCode" TEXT,
ADD COLUMN     "lockerFacility" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "neftImpsService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openingDate" TIMESTAMP(3),
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "rechargeService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isElder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMilitary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWidow" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Head" ADD COLUMN     "acGroup" TEXT,
ADD COLUMN     "crBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "drBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "interestAffected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interestGiven" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "opBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subGroup" TEXT;

-- AlterTable
ALTER TABLE "LoanAccount" ADD COLUMN     "balInterest" DECIMAL(18,2),
ADD COLUMN     "balOthers" DECIMAL(18,2),
ADD COLUMN     "balPenal" DECIMAL(18,2),
ADD COLUMN     "balRepayment" DECIMAL(18,2),
ADD COLUMN     "courtCase" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guarantor1Id" TEXT,
ADD COLUMN     "guarantor2Id" TEXT,
ADD COLUMN     "guarantor3Id" TEXT,
ADD COLUMN     "noticeIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penalInterestRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "Society" ADD COLUMN     "authorizedCapital" DECIMAL(18,2),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "gstNo" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "paidUpCapital" DECIMAL(18,2),
ADD COLUMN     "panNo" TEXT,
ADD COLUMN     "registrationAuthority" TEXT,
ADD COLUMN     "registrationDate" TIMESTAMP(3),
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "registrationState" TEXT,
ADD COLUMN     "shareNominalValue" DECIMAL(18,2),
ADD COLUMN     "tanNo" TEXT;

-- CreateTable
CREATE TABLE "Nominee" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "relation" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "phone" TEXT,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nominee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinorDetails" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentAddress" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinorDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentClient" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "depositPeriods" INTEGER,
    "depositUnits" TEXT,
    "installmentAmount" DECIMAL(18,2),
    "interestRate" DECIMAL(5,2),
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Nominee_accountId_idx" ON "Nominee"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "MinorDetails_customerId_key" ON "MinorDetails"("customerId");

-- CreateIndex
CREATE INDEX "AgentClient_agentId_isActive_idx" ON "AgentClient"("agentId", "isActive");

-- CreateIndex
CREATE INDEX "AgentClient_customerId_idx" ON "AgentClient"("customerId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_pigmyAgentId_fkey" FOREIGN KEY ("pigmyAgentId") REFERENCES "AgentClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_guarantor1Id_fkey" FOREIGN KEY ("guarantor1Id") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_guarantor2Id_fkey" FOREIGN KEY ("guarantor2Id") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_guarantor3Id_fkey" FOREIGN KEY ("guarantor3Id") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinorDetails" ADD CONSTRAINT "MinorDetails_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClient" ADD CONSTRAINT "AgentClient_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClient" ADD CONSTRAINT "AgentClient_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
