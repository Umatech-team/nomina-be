/*
  Warnings:

  - You are about to drop the column `monthly_contribution` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `goals` table. All the data in the column will be lost.
  - Added the required column `category` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Made the column `updated_at` on table `goals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "goals" DROP COLUMN "monthly_contribution",
DROP COLUMN "title",
ADD COLUMN     "category" TEXT NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
