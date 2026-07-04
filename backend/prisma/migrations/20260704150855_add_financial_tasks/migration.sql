-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "financial_tasks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "estimated_amount" DECIMAL(12,2),
    "account_id" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "financial_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_tasks_tenant_id_idx" ON "financial_tasks"("tenant_id");

-- CreateIndex
CREATE INDEX "financial_tasks_tenant_id_status_idx" ON "financial_tasks"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "financial_tasks_tenant_id_priority_idx" ON "financial_tasks"("tenant_id", "priority");

-- CreateIndex
CREATE INDEX "financial_tasks_tenant_id_due_date_idx" ON "financial_tasks"("tenant_id", "due_date");

-- AddForeignKey
ALTER TABLE "financial_tasks" ADD CONSTRAINT "financial_tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_tasks" ADD CONSTRAINT "financial_tasks_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
