-- Step 1: Add title columns as nullable
ALTER TABLE "recurring_transactions" ADD COLUMN "title" text;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "title" text;
--> statement-breakpoint

-- Step 2: Copy existing description data into title
UPDATE "recurring_transactions"
SET
    "title" = "description"
WHERE
    "title" IS NULL;
--> statement-breakpoint
UPDATE "transactions"
SET
    "title" = "description"
WHERE
    "title" IS NULL;
--> statement-breakpoint

-- Step 3: Make title NOT NULL now that all rows have a value
ALTER TABLE "recurring_transactions"
ALTER COLUMN "title"
SET
    NOT NULL;
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "title" SET NOT NULL;
--> statement-breakpoint

-- Step 4: Make description nullable
ALTER TABLE "recurring_transactions"
ALTER COLUMN "description"
DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "description" DROP NOT NULL;