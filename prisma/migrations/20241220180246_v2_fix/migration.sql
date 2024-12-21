/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `payment_history` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `payment_history` table. All the data in the column will be lost.
  - Made the column `timezone` on table `members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `language` on table `members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `members` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `payment_method` to the `payment_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_status` to the `payment_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "members" ALTER COLUMN "timezone" SET NOT NULL,
ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL;

-- AlterTable
ALTER TABLE "payment_history" DROP COLUMN "paymentMethod",
DROP COLUMN "paymentStatus",
ADD COLUMN     "payment_method" TEXT NOT NULL,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL;
