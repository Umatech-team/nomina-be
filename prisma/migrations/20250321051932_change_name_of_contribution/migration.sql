/*
  Warnings:

  - You are about to drop the column `montly_amount` on the `goals` table. All the data in the column will be lost.
  - Added the required column `montly_contribution` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "goals" DROP COLUMN "montly_amount",
ADD COLUMN     "montly_contribution" DOUBLE PRECISION NOT NULL;
