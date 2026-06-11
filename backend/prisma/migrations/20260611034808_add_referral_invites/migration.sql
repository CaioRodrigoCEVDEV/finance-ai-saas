-- CreateEnum
CREATE TYPE "ReferralInviteStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "referral_invites" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "user_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "target_path" TEXT NOT NULL DEFAULT '/',
    "status" "ReferralInviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "signups" INTEGER NOT NULL DEFAULT 0,
    "last_click_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "referral_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_invites_code_key" ON "referral_invites"("code");

-- CreateIndex
CREATE INDEX "referral_invites_tenant_id_idx" ON "referral_invites"("tenant_id");

-- CreateIndex
CREATE INDEX "referral_invites_user_id_idx" ON "referral_invites"("user_id");

-- CreateIndex
CREATE INDEX "referral_invites_code_idx" ON "referral_invites"("code");

-- CreateIndex
CREATE INDEX "referral_invites_status_idx" ON "referral_invites"("status");

-- AddForeignKey
ALTER TABLE "referral_invites" ADD CONSTRAINT "referral_invites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_invites" ADD CONSTRAINT "referral_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
