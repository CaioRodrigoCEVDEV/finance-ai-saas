ALTER TABLE "transactions" ADD COLUMN "installment_group_id" UUID;

CREATE INDEX "transactions_installment_group_id_idx" ON "transactions"("installment_group_id");

CREATE UNIQUE INDEX "transactions_active_installment_group_number_key"
ON "transactions"("installment_group_id", "installment_number")
WHERE "deleted_at" IS NULL AND "installment_group_id" IS NOT NULL;
