const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { encryptSecret, decryptSecret, maskSecret } = require('../billing/billing-secret.helper');
const stripeBillingService = require('../billing/stripeBillingService');
const mercadoPagoBillingService = require('../billing/mercadoPagoBillingService');

function sanitizeGateway(config) {
  return {
    id: config.id,
    provider: config.provider,
    enabled: config.enabled,
    environment: config.environment,
    publicKey: config.publicKey,
    secretKeyMasked: maskSecret(decryptSecret(config.secretKeyEncrypted)),
    webhookSecretMasked: maskSecret(decryptSecret(config.webhookSecretEncrypted)),
    monthlyPlanExternalId: config.monthlyPlanExternalId,
    yearlyPlanExternalId: config.yearlyPlanExternalId,
    successUrl: config.successUrl,
    cancelUrl: config.cancelUrl,
    failureUrl: config.failureUrl,
    pendingUrl: config.pendingUrl,
    webhookUrl: config.webhookUrl,
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString()
  };
}

function sanitizeBillingPlan(plan) {
  return {
    id: plan.id,
    plan: plan.plan,
    billingCycle: plan.billingCycle,
    currency: plan.currency,
    amount: Number(plan.amount),
    active: plan.active,
    stripePriceId: plan.stripePriceId,
    mercadoPagoPlanId: plan.mercadoPagoPlanId,
    defaultProvider: plan.defaultProvider,
    allowProviderSelection: plan.allowProviderSelection,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString()
  };
}

async function getPaymentSettings() {
  const [gateways, plans] = await Promise.all([
    prisma.paymentGatewayConfig.findMany({ orderBy: { provider: 'asc' } }),
    prisma.billingPlan.findMany({ orderBy: [{ plan: 'asc' }, { billingCycle: 'asc' }] })
  ]);

  return {
    gateways: gateways.map(sanitizeGateway),
    plans: plans.map(sanitizeBillingPlan)
  };
}

async function updateGateway(provider, payload) {
  const existing = await prisma.paymentGatewayConfig.findUnique({ where: { provider } });
  if (!existing) {
    throw new AppError('Gateway nao encontrado', 404);
  }

  const updateData = {
    enabled: payload.enabled,
    environment: payload.environment,
    publicKey: payload.publicKey,
    monthlyPlanExternalId: payload.monthlyPlanExternalId,
    yearlyPlanExternalId: payload.yearlyPlanExternalId,
    successUrl: payload.successUrl,
    cancelUrl: payload.cancelUrl,
    failureUrl: payload.failureUrl,
    pendingUrl: payload.pendingUrl,
    webhookUrl: payload.webhookUrl
  };

  if (payload.secretKey) {
    updateData.secretKeyEncrypted = encryptSecret(payload.secretKey);
  }

  if (payload.webhookSecret) {
    updateData.webhookSecretEncrypted = encryptSecret(payload.webhookSecret);
  }

  const updated = await prisma.paymentGatewayConfig.update({
    where: { provider },
    data: updateData
  });

  return sanitizeGateway(updated);
}

async function testGateway(provider) {
  const config = await prisma.paymentGatewayConfig.findUnique({ where: { provider } });
  if (!config) {
    throw new AppError('Gateway nao encontrado', 404);
  }

  if (provider === 'STRIPE') {
    return stripeBillingService.testCredentials(config);
  }

  return mercadoPagoBillingService.testCredentials(config);
}

async function updatePlans(payload) {
  const entries = [
    {
      billingCycle: 'MONTHLY',
      amount: payload.monthlyAmount,
      currency: payload.currency,
      defaultProvider: payload.defaultProvider,
      allowProviderSelection: payload.allowProviderSelection
    },
    {
      billingCycle: 'YEARLY',
      amount: payload.yearlyAmount,
      currency: payload.currency,
      defaultProvider: payload.defaultProvider,
      allowProviderSelection: payload.allowProviderSelection
    }
  ];

  await Promise.all(entries.map((entry) => prisma.billingPlan.upsert({
    where: { plan_billingCycle: { plan: 'PREMIUM', billingCycle: entry.billingCycle } },
    create: {
      plan: 'PREMIUM',
      billingCycle: entry.billingCycle,
      amount: entry.amount,
      currency: entry.currency,
      active: true,
      defaultProvider: entry.defaultProvider,
      allowProviderSelection: entry.allowProviderSelection
    },
    update: {
      amount: entry.amount,
      currency: entry.currency,
      defaultProvider: entry.defaultProvider,
      allowProviderSelection: entry.allowProviderSelection
    }
  })));

  return getPaymentSettings();
}

module.exports = {
  getPaymentSettings,
  updateGateway,
  testGateway,
  updatePlans
};
