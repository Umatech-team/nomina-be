/*
  Warnings:

  - You are about to drop the column `category` on the `goals` table. All the data in the column will be lost.
  - Added the required column `title` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "goals" DROP COLUMN "category",
ADD COLUMN     "title" TEXT NOT NULL;
