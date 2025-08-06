/*
  Warnings:

  - You are about to alter the column `current_amount` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `target_amount` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `montly_contribution` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `total_income` on the `member_monthly_summary` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `total_expense` on the `member_monthly_summary` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `total_investments` on the `member_monthly_summary` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `balance` on the `member_monthly_summary` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `amount` on the `payment_history` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DEFAULT 0,
ALTER COLUMN "current_amount" SET DATA TYPE BIGINT,
ALTER COLUMN "target_amount" SET DATA TYPE BIGINT,
ALTER COLUMN "montly_contribution" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "member_monthly_summary" ALTER COLUMN "total_income" SET DEFAULT 0,
ALTER COLUMN "total_income" SET DATA TYPE BIGINT,
ALTER COLUMN "total_expense" SET DEFAULT 0,
ALTER COLUMN "total_expense" SET DATA TYPE BIGINT,
ALTER COLUMN "total_investments" SET DEFAULT 0,
ALTER COLUMN "total_investments" SET DATA TYPE BIGINT,
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "payment_history" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE BIGINT;
