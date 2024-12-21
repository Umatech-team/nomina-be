/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `planEndDate` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `planStartDate` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `renewalDate` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `supportTier` on the `members` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "members_planStartDate_planEndDate_idx";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "paymentStatus",
DROP COLUMN "planEndDate",
DROP COLUMN "planStartDate",
DROP COLUMN "renewalDate",
DROP COLUMN "supportTier",
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
ADD COLUMN     "plan_end_date" TIMESTAMP(3),
ADD COLUMN     "plan_start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "renewal_date" TIMESTAMP(3),
ADD COLUMN     "support_tier" "SupportTier" NOT NULL DEFAULT 'STANDARD';

-- CreateIndex
CREATE INDEX "members_plan_start_date_plan_end_date_idx" ON "members"("plan_start_date", "plan_end_date");
