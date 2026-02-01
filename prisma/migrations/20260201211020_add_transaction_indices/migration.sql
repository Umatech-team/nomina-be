-- CreateIndex
CREATE INDEX "transactions_workspace_id_category_id_idx" ON "transactions"("workspace_id", "category_id");

-- CreateIndex
CREATE INDEX "transactions_workspace_id_type_status_idx" ON "transactions"("workspace_id", "type", "status");
