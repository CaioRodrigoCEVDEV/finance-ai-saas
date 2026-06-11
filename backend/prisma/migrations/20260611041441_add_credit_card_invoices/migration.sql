-- AlterEnum
ALTER TYPE "TransactionSource" ADD VALUE 'CREDIT_CARD_PAYMENT';

-- CreateTable
CREATE TABLE "credit_card_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "credit_card_id" UUID NOT NULL,
    "reference_month" INTEGER NOT NULL,
    "reference_year" INTEGER NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "closing_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "paid_at" TIMESTAMP(3),
    "payment_account_id" UUID,
    "payment_transaction_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "credit_card_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_invoices_payment_transaction_id_key" ON "credit_card_invoices"("payment_transaction_id");

-- CreateIndex
CREATE INDEX "credit_card_invoices_tenant_id_idx" ON "credit_card_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "credit_card_invoices_credit_card_id_idx" ON "credit_card_invoices"("credit_card_id");

-- CreateIndex
CREATE INDEX "credit_card_invoices_status_idx" ON "credit_card_invoices"("status");

-- CreateIndex
CREATE INDEX "credit_card_invoices_due_date_idx" ON "credit_card_invoices"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_invoices_tenant_id_credit_card_id_reference_mon_key" ON "credit_card_invoices"("tenant_id", "credit_card_id", "reference_month", "reference_year");

-- AddForeignKey
ALTER TABLE "credit_card_invoices" ADD CONSTRAINT "credit_card_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_invoices" ADD CONSTRAINT "credit_card_invoices_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_invoices" ADD CONSTRAINT "credit_card_invoices_payment_account_id_fkey" FOREIGN KEY ("payment_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_invoices" ADD CONSTRAINT "credit_card_invoices_payment_transaction_id_fkey" FOREIGN KEY ("payment_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
