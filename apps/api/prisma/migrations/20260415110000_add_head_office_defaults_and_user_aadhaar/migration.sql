-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "aadhaarNumber" TEXT,
ADD COLUMN     "isSocietyAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_aadhaarNumber_key" ON "User"("aadhaarNumber");

-- Backfill earliest society administrator as the admin account for each society
WITH ranked_society_admins AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (PARTITION BY "societyId" ORDER BY "createdAt" ASC, "id" ASC) AS rank_in_society
    FROM "User"
    WHERE "role" = 'SUPER_USER'::"UserRole"
      AND "societyId" IS NOT NULL
)
UPDATE "User" AS target
SET "isSocietyAdmin" = ranked_society_admins.rank_in_society = 1
FROM ranked_society_admins
WHERE target."id" = ranked_society_admins."id";
