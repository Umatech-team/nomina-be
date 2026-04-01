ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_destination_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_account_id_fkey";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_destination_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_destination_account_id_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;