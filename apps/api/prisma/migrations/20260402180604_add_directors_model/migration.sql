-- CreateTable
CREATE TABLE "Director" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "din" TEXT,
    "designation" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "dob" TIMESTAMP(3),
    "email" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "occupation" TEXT,
    "panNo" TEXT,
    "aadharNo" TEXT,
    "gender" TEXT,
    "mobileNo" TEXT,
    "appointmentDate" TIMESTAMP(3),
    "resignationDate" TIMESTAMP(3),
    "isAuthorizedSignatory" BOOLEAN NOT NULL DEFAULT false,
    "registrationDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "accountNo" TEXT,
    "bankName" TEXT,
    "ifscCode" TEXT,
    "correspondingAddress" TEXT,
    "permanentAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Director_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Director_din_key" ON "Director"("din");

-- CreateIndex
CREATE INDEX "Director_societyId_idx" ON "Director"("societyId");

-- AddForeignKey
ALTER TABLE "Director" ADD CONSTRAINT "Director_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
