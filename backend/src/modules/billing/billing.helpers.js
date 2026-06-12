const prisma = require('../../config/prisma');
const { createAuditLogEntry } = require('../../middlewares/audit-log');

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sanitizeSubscription(subscription) {
  if (!subscription) {
    return {
      plan: 'FREE',
      status: 'FREE',
      billingCycle: null,
      provider: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    };
  }

  return {
    id: subscription.id,
    plan: subscription.plan,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    provider: subscription.provider,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
    cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd)
  };
}

async function getLatestTenantSubscription(tenantId) {
  return prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: [
      { updatedAt: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}

async function updateTenantPlanBySubscription(subscription, reason) {
  if (!subscription?.tenantId) {
    return;
  }

  const now = new Date();
  const keepPremium = subscription.plan === 'PREMIUM'
    && ['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status)
    && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd >= now);
  const nextPlan = keepPremium ? 'PREMIUM' : 'FREE';

  await prisma.tenant.update({
    where: { id: subscription.tenantId },
    data: { plan: nextPlan }
  });

  await createAuditLogEntry({
    tenantId: subscription.tenantId,
    action: 'PAYMENT_SYNC_TENANT_PLAN',
    entity: 'subscription',
    entityId: subscription.id,
    metadata: {
      reason,
      status: subscription.status,
      plan: subscription.plan,
      tenantPlan: nextPlan,
      provider: subscription.provider
    }
  });
}

module.exports = {
  normalizeDate,
  sanitizeSubscription,
  getLatestTenantSubscription,
  updateTenantPlanBySubscription
};
