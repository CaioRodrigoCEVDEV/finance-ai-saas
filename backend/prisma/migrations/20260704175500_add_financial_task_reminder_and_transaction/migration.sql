-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TASK_REMINDER';

-- AlterTable
ALTER TABLE "financial_tasks" ADD COLUMN     "reminder_at" TIMESTAMP(3),
ADD COLUMN     "notification_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "generated_transaction_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "financial_tasks_generated_transaction_id_key" ON "financial_tasks"("generated_transaction_id");

-- AddForeignKey
ALTER TABLE "financial_tasks" ADD CONSTRAINT "financial_tasks_generated_transaction_id_fkey" FOREIGN KEY ("generated_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
