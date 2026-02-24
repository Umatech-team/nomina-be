ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "workspace_users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "accounts"
ALTER COLUMN "type" TYPE TEXT USING "type"::text;

ALTER TABLE "categories"
ALTER COLUMN "type" TYPE TEXT USING "type"::text;

ALTER TABLE "transactions"
ALTER COLUMN "type" TYPE TEXT USING "type"::text;

ALTER TABLE "transactions"
ALTER COLUMN "status" TYPE TEXT USING "status"::text;

ALTER TABLE "recurring_transactions"
ALTER COLUMN "type" TYPE TEXT USING "type"::text;

ALTER TABLE "recurring_transactions"
ALTER COLUMN "frequency" TYPE TEXT USING "frequency"::text;

ALTER TABLE "workspace_users"
ALTER COLUMN "role" TYPE TEXT USING "role"::text;

ALTER TABLE "workspace_invites"
ALTER COLUMN "role" TYPE TEXT USING "role"::text;

ALTER TABLE "subscriptions"
ALTER COLUMN "status" TYPE TEXT USING "status"::text;

DROP TYPE IF EXISTS "AccountType" CASCADE;

DROP TYPE IF EXISTS "CategoryType" CASCADE;

DROP TYPE IF EXISTS "TransactionType" CASCADE;

DROP TYPE IF EXISTS "TransactionStatus" CASCADE;

DROP TYPE IF EXISTS "Frequency" CASCADE;

DROP TYPE IF EXISTS "UserRole" CASCADE;

DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;

ALTER TABLE "transactions"
ALTER COLUMN "status"
SET DEFAULT 'COMPLETED';