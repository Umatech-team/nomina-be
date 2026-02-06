/*
  Warnings:

  - You are about to drop the column `owner_id` on the `workspaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workspace_users" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "owner_id";
