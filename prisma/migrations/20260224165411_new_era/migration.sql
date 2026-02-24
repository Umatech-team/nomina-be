/*
  Warnings:

  - You are about to drop the column `color` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - Made the column `category_id` on table `recurring_transactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category_id` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "color",
DROP COLUMN "icon";

-- AlterTable
ALTER TABLE "recurring_transactions" ALTER COLUMN "category_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "category_id" SET NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropEnum
DROP TYPE "RecurrenceFrequency";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
