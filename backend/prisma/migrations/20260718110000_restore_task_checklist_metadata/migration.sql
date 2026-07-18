-- AlterTable
ALTER TABLE "financial_task_items"
  ADD COLUMN "updated_at" TIMESTAMP(3),
  ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Backfill existing rows
UPDATE "financial_task_items"
SET "updated_at" = "created_at"
WHERE "updated_at" IS NULL;

-- Enforce defaults and nullability
ALTER TABLE "financial_task_items"
  ALTER COLUMN "updated_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
