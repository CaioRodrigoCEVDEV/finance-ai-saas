-- AlterTable
ALTER TABLE "financial_tasks" ADD COLUMN "auto_complete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_task_items" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_task_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_tenant_id_endpoint_key" ON "push_subscriptions"("tenant_id", "endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_tenant_id_idx" ON "push_subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "financial_task_items_task_id_idx" ON "financial_task_items"("task_id");

-- CreateIndex
CREATE INDEX "financial_task_items_task_id_completed_idx" ON "financial_task_items"("task_id", "completed");

-- CreateIndex
CREATE INDEX "financial_task_items_task_id_order_idx" ON "financial_task_items"("task_id", "order");

-- AddForeignKey
ALTER TABLE "financial_task_items" ADD CONSTRAINT "financial_task_items_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "financial_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
