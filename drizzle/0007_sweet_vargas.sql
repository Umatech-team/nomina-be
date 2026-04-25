ALTER TABLE "accounts" ADD COLUMN "time_zone" text DEFAULT 'America/Sao_Paulo' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "installment_group_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "installment_number" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "installment_count" integer;--> statement-breakpoint
CREATE INDEX "idx_trans_installment_group" ON "transactions" USING btree ("installment_group_id");--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "icon";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "color";