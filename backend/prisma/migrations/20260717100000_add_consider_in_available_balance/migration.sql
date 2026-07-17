-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "consider_in_available_balance" BOOLEAN NOT NULL DEFAULT true;

-- Update existing accounts
UPDATE "accounts" SET "consider_in_available_balance" = true;
