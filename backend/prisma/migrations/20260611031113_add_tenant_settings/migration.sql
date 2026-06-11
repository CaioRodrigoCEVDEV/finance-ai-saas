-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "financial_month_start_day" INTEGER NOT NULL DEFAULT 1,
    "default_account_id" UUID,
    "default_expense_category_id" UUID,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "notify_budget_warning" BOOLEAN NOT NULL DEFAULT true,
    "notify_budget_exceeded" BOOLEAN NOT NULL DEFAULT true,
    "notify_invoice_due" BOOLEAN NOT NULL DEFAULT true,
    "notify_goal_behind" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_default_account_id_fkey" FOREIGN KEY ("default_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_default_expense_category_id_fkey" FOREIGN KEY ("default_expense_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
