const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { getPlanLimits } = require('../../config/planLimits');

async function getTenantPlan(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true }
  });

  return tenant?.plan || 'FREE';
}

async function assertCanCreateAccount(tenantId) {
  const plan = await getTenantPlan(tenantId);
  const limits = getPlanLimits(plan);

  if (limits.maxAccounts === null) {
    return;
  }

  const count = await prisma.account.count({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    }
  });

  if (count >= limits.maxAccounts) {
    throw new AppError(
      'Seu plano gratuito permite apenas 1 conta financeira. Faça upgrade para adicionar mais contas.',
      403,
      'PLAN_LIMIT_REACHED'
    );
  }
}

async function assertCanCreateCreditCard(tenantId) {
  const plan = await getTenantPlan(tenantId);
  const limits = getPlanLimits(plan);

  if (limits.maxCreditCards === null) {
    return;
  }

  const count = await prisma.creditCard.count({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    }
  });

  if (count >= limits.maxCreditCards) {
    throw new AppError(
      'Seu plano gratuito permite apenas 1 cartão de crédito. Faça upgrade para adicionar mais cartões.',
      403,
      'PLAN_LIMIT_REACHED'
    );
  }
}

module.exports = {
  getTenantPlan,
  assertCanCreateAccount,
  assertCanCreateCreditCard
};
