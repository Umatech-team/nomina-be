/*
  Warnings:

  - Added the required column `subCategory` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "subCategory" TEXT NOT NULL;
