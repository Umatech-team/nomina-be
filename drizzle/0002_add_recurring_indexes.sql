CREATE INDEX "idx_recurring_active_start" ON "recurring_transactions" USING btree ("active","start_date");--> statement-breakpoint
CREATE INDEX "idx_recurring_workspace_active" ON "recurring_transactions" USING btree ("workspace_id","active");--> statement-breakpoint
CREATE INDEX "idx_recurring_last_generated" ON "recurring_transactions" USING btree ("last_generated");