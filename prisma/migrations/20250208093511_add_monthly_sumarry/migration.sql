/*
  Warnings:

  - You are about to drop the column `balance` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "balance";

-- CreateTable
CREATE TABLE "member_monthly_summary" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "total_income" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_expense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_investments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "member_monthly_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_monthly_summary_month_idx" ON "member_monthly_summary"("month");

-- CreateIndex
CREATE UNIQUE INDEX "member_monthly_summary_member_id_month_key" ON "member_monthly_summary"("member_id", "month");

-- AddForeignKey
ALTER TABLE "member_monthly_summary" ADD CONSTRAINT "member_monthly_summary_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
