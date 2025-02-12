/*
  Warnings:

  - Changed the type of `month` on the `member_monthly_summary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "member_monthly_summary" DROP COLUMN "month",
ADD COLUMN     "month" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "member_monthly_summary_month_idx" ON "member_monthly_summary"("month");

-- CreateIndex
CREATE UNIQUE INDEX "member_monthly_summary_member_id_month_key" ON "member_monthly_summary"("member_id", "month");
