/*
Warnings:

- A unique constraint covering the columns `[workspace_id,name,type,parent_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories"
ADD COLUMN "is_system_category" BOOLEAN NOT NULL DEFAULT false;

-- Update existing null workspace_id records to be system categories
UPDATE "categories"
SET
    "is_system_category" = true
WHERE
    "workspace_id" IS NULL;

-- CreateIndex (Partial unique index for system categories - name, type, parentId must be unique)
CREATE UNIQUE INDEX "categories_system_unique" ON "categories"(name, type, COALESCE(parent_id, '')) WHERE is_system_category = true;

-- CreateIndex
CREATE INDEX "categories_workspace_id_type_idx" ON "categories" ("workspace_id", "type");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories" ("parent_id");

-- CreateIndex
CREATE INDEX "categories_is_system_category_idx" ON "categories" ("is_system_category");

-- CreateIndex (Unique constraint for workspace categories)
CREATE UNIQUE INDEX "categories_workspace_id_name_type_parent_id_key" ON "categories" (
    "workspace_id",
    "name",
    "type",
    "parent_id"
);