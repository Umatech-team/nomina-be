/*
  Warnings:

  - You are about to drop the column `percentage` on the `goals` table. All the data in the column will be lost.
  - Added the required column `target_amount` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "percentage",
ADD COLUMN     "current_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "target_amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'LOW';

-- AlterTable
ALTER TABLE "payment_history" ADD COLUMN     "external_id" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "currency" TEXT NOT NULL;
