/*
  Warnings:

  - Added the required column `method` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionMethod" AS ENUM ('CASH', 'CARD', 'PIX');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "method" "TransactionMethod" NOT NULL;
