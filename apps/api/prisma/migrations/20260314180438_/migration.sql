-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'AGENT', 'SUPER_USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "SocietyStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CURRENT', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'PIGMY', 'GENERAL');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'FROZEN', 'DORMANT', 'CLOSED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "TransactionMode" AS ENUM ('CASH', 'CHEQUE', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('APPLIED', 'SANCTIONED', 'DISBURSED', 'CLOSED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InstrumentStatus" AS ENUM ('ENTERED', 'CLEARED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IbcObcType" AS ENUM ('IBC', 'OBC');

-- CreateEnum
CREATE TYPE "LockerSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "LockerStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('QUEUED', 'RUNNING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'NET_BANKING');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('SUBSCRIPTION', 'SERVICE_CHARGE', 'LOAN_REPAYMENT', 'DEPOSIT_INSTALLMENT');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('OPEN', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Society" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SocietyStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "billingEmail" TEXT,
    "billingPhone" TEXT,
    "billingAddress" TEXT,
    "acceptsDigitalPayments" BOOLEAN NOT NULL DEFAULT false,
    "upiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Society_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "societyId" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextBillingDate" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocietySubscription" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextBillingDate" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocietySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "kycVerified" BOOLEAN NOT NULL DEFAULT false,
    "openingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "purpose" "PaymentPurpose" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "paymentRequestId" TEXT,
    "customerId" TEXT,
    "initiatedById" TEXT,
    "purpose" "PaymentPurpose" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,2) NOT NULL,
    "gatewayReference" TEXT NOT NULL,
    "remark" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "openingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentBalance" DECIMAL(18,2) NOT NULL,
    "interestRate" DECIMAL(5,2),
    "branchCode" TEXT,
    "isPassbookEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositScheme" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minMonths" INTEGER NOT NULL,
    "maxMonths" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositAccount" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "principalAmount" DECIMAL(18,2) NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "maturityAmount" DECIMAL(18,2) NOT NULL,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "lienMarked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanAccount" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "applicationAmount" DECIMAL(18,2) NOT NULL,
    "sanctionedAmount" DECIMAL(18,2),
    "disbursedAmount" DECIMAL(18,2),
    "sanctionDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "interestRate" DECIMAL(5,2) NOT NULL,
    "overdueAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" "LoanStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "valueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "mode" "TransactionMode" NOT NULL,
    "remark" TEXT,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "passedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "balanceAfter" DECIMAL(18,2) NOT NULL,
    "interestPayable" DECIMAL(18,2),
    "interestReceivable" DECIMAL(18,2),
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChequeBookIssue" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "startLeaf" INTEGER NOT NULL,
    "endLeaf" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChequeBookIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandDraft" (
    "id" TEXT NOT NULL,
    "draftNumber" TEXT NOT NULL,
    "accountId" TEXT,
    "customerId" TEXT,
    "beneficiary" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "InstrumentStatus" NOT NULL DEFAULT 'ENTERED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedAt" TIMESTAMP(3),

    CONSTRAINT "DemandDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChequeClearing" (
    "id" TEXT NOT NULL,
    "chequeNumber" TEXT NOT NULL,
    "accountId" TEXT,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "InstrumentStatus" NOT NULL DEFAULT 'ENTERED',
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clearedDate" TIMESTAMP(3),

    CONSTRAINT "ChequeClearing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IbcObcInstrument" (
    "id" TEXT NOT NULL,
    "instrumentNumber" TEXT NOT NULL,
    "type" "IbcObcType" NOT NULL,
    "accountId" TEXT,
    "customerId" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "InstrumentStatus" NOT NULL DEFAULT 'ENTERED',
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedDate" TIMESTAMP(3),

    CONSTRAINT "IbcObcInstrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "investmentType" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "maturityAmount" DECIMAL(18,2),
    "withdrawnDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locker" (
    "id" TEXT NOT NULL,
    "lockerNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "size" "LockerSize" NOT NULL,
    "status" "LockerStatus" NOT NULL DEFAULT 'ACTIVE',
    "openingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "annualCharge" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "Locker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockerVisit" (
    "id" TEXT NOT NULL,
    "lockerId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "LockerVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashBookEntry" (
    "id" TEXT NOT NULL,
    "headCode" TEXT NOT NULL,
    "headName" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "mode" "TransactionMode" NOT NULL,
    "remark" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingDay" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isDayEnd" BOOLEAN NOT NULL DEFAULT false,
    "isMonthEnd" BOOLEAN NOT NULL DEFAULT false,
    "isYearEnd" BOOLEAN NOT NULL DEFAULT false,
    "openedById" TEXT,
    "closedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportJob" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "parameters" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'QUEUED',
    "requestedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" JSONB,
    "performedById" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Society_code_key" ON "Society"("code");

-- CreateIndex
CREATE INDEX "Society_name_idx" ON "Society"("name");

-- CreateIndex
CREATE INDEX "Society_status_isActive_idx" ON "Society"("status", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_customerId_key" ON "User"("customerId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_societyId_idx" ON "User"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_plan_status_idx" ON "Subscription"("plan", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SocietySubscription_societyId_key" ON "SocietySubscription"("societyId");

-- CreateIndex
CREATE INDEX "SocietySubscription_plan_status_idx" ON "SocietySubscription"("plan", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE INDEX "Customer_customerCode_idx" ON "Customer"("customerCode");

-- CreateIndex
CREATE INDEX "Customer_societyId_idx" ON "Customer"("societyId");

-- CreateIndex
CREATE INDEX "PaymentRequest_societyId_status_idx" ON "PaymentRequest"("societyId", "status");

-- CreateIndex
CREATE INDEX "PaymentRequest_customerId_status_idx" ON "PaymentRequest"("customerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_gatewayReference_key" ON "PaymentTransaction"("gatewayReference");

-- CreateIndex
CREATE INDEX "PaymentTransaction_societyId_status_createdAt_idx" ON "PaymentTransaction"("societyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentTransaction_customerId_createdAt_idx" ON "PaymentTransaction"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentRequestId_idx" ON "PaymentTransaction"("paymentRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE INDEX "Account_accountNumber_idx" ON "Account"("accountNumber");

-- CreateIndex
CREATE INDEX "Account_societyId_idx" ON "Account"("societyId");

-- CreateIndex
CREATE INDEX "Account_customerId_idx" ON "Account"("customerId");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "Account"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DepositScheme_code_key" ON "DepositScheme"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DepositAccount_accountId_key" ON "DepositAccount"("accountId");

-- CreateIndex
CREATE INDEX "DepositAccount_maturityDate_idx" ON "DepositAccount"("maturityDate");

-- CreateIndex
CREATE UNIQUE INDEX "LoanAccount_accountId_key" ON "LoanAccount"("accountId");

-- CreateIndex
CREATE INDEX "LoanAccount_status_idx" ON "LoanAccount"("status");

-- CreateIndex
CREATE INDEX "LoanAccount_customerId_idx" ON "LoanAccount"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionNumber_key" ON "Transaction"("transactionNumber");

-- CreateIndex
CREATE INDEX "Transaction_accountId_valueDate_idx" ON "Transaction"("accountId", "valueDate");

-- CreateIndex
CREATE INDEX "Transaction_isPassed_idx" ON "Transaction"("isPassed");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_postedAt_idx" ON "LedgerEntry"("accountId", "postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DemandDraft_draftNumber_key" ON "DemandDraft"("draftNumber");

-- CreateIndex
CREATE INDEX "DemandDraft_status_idx" ON "DemandDraft"("status");

-- CreateIndex
CREATE INDEX "ChequeClearing_chequeNumber_idx" ON "ChequeClearing"("chequeNumber");

-- CreateIndex
CREATE INDEX "ChequeClearing_status_idx" ON "ChequeClearing"("status");

-- CreateIndex
CREATE INDEX "IbcObcInstrument_instrumentNumber_idx" ON "IbcObcInstrument"("instrumentNumber");

-- CreateIndex
CREATE INDEX "IbcObcInstrument_type_status_idx" ON "IbcObcInstrument"("type", "status");

-- CreateIndex
CREATE INDEX "Investment_bankName_idx" ON "Investment"("bankName");

-- CreateIndex
CREATE INDEX "Investment_maturityDate_idx" ON "Investment"("maturityDate");

-- CreateIndex
CREATE UNIQUE INDEX "Locker_lockerNumber_key" ON "Locker"("lockerNumber");

-- CreateIndex
CREATE INDEX "Locker_status_idx" ON "Locker"("status");

-- CreateIndex
CREATE INDEX "LockerVisit_lockerId_visitedAt_idx" ON "LockerVisit"("lockerId", "visitedAt");

-- CreateIndex
CREATE INDEX "CashBookEntry_entryDate_isPosted_idx" ON "CashBookEntry"("entryDate", "isPosted");

-- CreateIndex
CREATE INDEX "WorkingDay_societyId_date_idx" ON "WorkingDay"("societyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingDay_societyId_date_key" ON "WorkingDay"("societyId", "date");

-- CreateIndex
CREATE INDEX "ReportJob_category_status_idx" ON "ReportJob"("category", "status");

-- CreateIndex
CREATE INDEX "AuditLog_module_action_performedAt_idx" ON "AuditLog"("module", "action", "performedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietySubscription" ADD CONSTRAINT "SocietySubscription_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "PaymentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositAccount" ADD CONSTRAINT "DepositAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositAccount" ADD CONSTRAINT "DepositAccount_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "DepositScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccount" ADD CONSTRAINT "LoanAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeBookIssue" ADD CONSTRAINT "ChequeBookIssue_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandDraft" ADD CONSTRAINT "DemandDraft_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandDraft" ADD CONSTRAINT "DemandDraft_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeClearing" ADD CONSTRAINT "ChequeClearing_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IbcObcInstrument" ADD CONSTRAINT "IbcObcInstrument_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IbcObcInstrument" ADD CONSTRAINT "IbcObcInstrument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locker" ADD CONSTRAINT "Locker_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockerVisit" ADD CONSTRAINT "LockerVisit_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "Locker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashBookEntry" ADD CONSTRAINT "CashBookEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingDay" ADD CONSTRAINT "WorkingDay_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingDay" ADD CONSTRAINT "WorkingDay_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingDay" ADD CONSTRAINT "WorkingDay_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportJob" ADD CONSTRAINT "ReportJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
