-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "global_role" "GlobalRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "plan_limits" (
    "id" UUID NOT NULL,
    "plan" "TenantPlan" NOT NULL,
    "max_accounts" INTEGER NOT NULL DEFAULT 1,
    "max_credit_cards" INTEGER NOT NULL DEFAULT 1,
    "max_users" INTEGER NOT NULL DEFAULT 1,
    "max_transactions_per_month" INTEGER NOT NULL DEFAULT 200,
    "can_import" BOOLEAN NOT NULL DEFAULT false,
    "can_export_reports" BOOLEAN NOT NULL DEFAULT false,
    "can_use_ai" BOOLEAN NOT NULL DEFAULT false,
    "can_use_open_finance" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_limits_plan_key" ON "plan_limits"("plan");
