-- DropIndex
DROP INDEX "transactions_workspace_id_category_id_idx";

-- DropIndex
DROP INDEX "transactions_workspace_id_date_idx";

-- DropIndex
DROP INDEX "transactions_workspace_id_type_status_idx";

-- CreateIndex
CREATE INDEX "transactions_workspace_id_date_status_type_idx" ON "transactions"("workspace_id", "date", "status", "type");

-- CreateIndex
CREATE INDEX "transactions_workspace_id_category_id_type_date_idx" ON "transactions"("workspace_id", "category_id", "type", "date");
