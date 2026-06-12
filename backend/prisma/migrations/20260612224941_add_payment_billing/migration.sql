-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MERCADO_PAGO');

-- CreateEnum
CREATE TYPE "PaymentEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('FREE', 'TRIAL', 'PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "BillingPlanType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "payment_gateway_configs" (
    "id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "environment" "PaymentEnvironment" NOT NULL DEFAULT 'SANDBOX',
    "public_key" TEXT,
    "secret_key_encrypted" TEXT,
    "webhook_secret_encrypted" TEXT,
    "monthly_plan_external_id" TEXT,
    "yearly_plan_external_id" TEXT,
    "success_url" TEXT,
    "cancel_url" TEXT,
    "failure_url" TEXT,
    "pending_url" TEXT,
    "webhook_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_plans" (
    "id" UUID NOT NULL,
    "plan" "BillingPlanType" NOT NULL,
    "billing_cycle" "BillingCycle" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_price_id" TEXT,
    "mercado_pago_plan_id" TEXT,
    "default_provider" "PaymentProvider",
    "allow_provider_selection" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "provider" "PaymentProvider",
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'FREE',
    "plan" "BillingPlanType" NOT NULL DEFAULT 'FREE',
    "billing_cycle" "BillingCycle",
    "external_customer_id" TEXT,
    "external_subscription_id" TEXT,
    "external_checkout_session_id" TEXT,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_event_logs" (
    "id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "event_type" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "tenant_id" UUID,
    "subscription_id" UUID,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_configs_provider_key" ON "payment_gateway_configs"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "billing_plans_plan_billing_cycle_key" ON "billing_plans"("plan", "billing_cycle");

-- CreateIndex
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "subscriptions_tenant_id_status_idx" ON "subscriptions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "subscriptions_external_subscription_id_idx" ON "subscriptions"("external_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_external_checkout_session_id_idx" ON "subscriptions"("external_checkout_session_id");

-- CreateIndex
CREATE INDEX "payment_event_logs_tenant_id_idx" ON "payment_event_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_event_logs_subscription_id_idx" ON "payment_event_logs"("subscription_id");

-- CreateIndex
CREATE INDEX "payment_event_logs_provider_processed_idx" ON "payment_event_logs"("provider", "processed");

-- CreateIndex
CREATE INDEX "payment_event_logs_created_at_idx" ON "payment_event_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_event_logs_provider_external_event_id_key" ON "payment_event_logs"("provider", "external_event_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_event_logs" ADD CONSTRAINT "payment_event_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_event_logs" ADD CONSTRAINT "payment_event_logs_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
