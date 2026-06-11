-- AlterEnum
ALTER TYPE "TransactionSource" ADD VALUE 'RECURRENCE';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "recurrence_id" UUID;

-- CreateTable
CREATE TABLE "recurrences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "account_id" UUID,
    "credit_card_id" UUID,
    "category_id" UUID,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "next_run_date" TIMESTAMP(3) NOT NULL,
    "last_run_date" TIMESTAMP(3),
    "payment_method" TEXT,
    "notes" TEXT,
    "auto_generate" BOOLEAN NOT NULL DEFAULT false,
    "generate_as_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurrences_tenant_id_idx" ON "recurrences"("tenant_id");

-- CreateIndex
CREATE INDEX "recurrences_status_idx" ON "recurrences"("status");

-- CreateIndex
CREATE INDEX "recurrences_next_run_date_idx" ON "recurrences"("next_run_date");

-- CreateIndex
CREATE INDEX "recurrences_tenant_id_next_run_date_idx" ON "recurrences"("tenant_id", "next_run_date");

-- CreateIndex
CREATE INDEX "transactions_recurrence_id_idx" ON "transactions"("recurrence_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrences" ADD CONSTRAINT "recurrences_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
