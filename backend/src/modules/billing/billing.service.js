const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const stripeBillingService = require('./stripeBillingService');
const mercadoPagoBillingService = require('./mercadoPagoBillingService');
const { sanitizeSubscription, getLatestTenantSubscription, normalizeDate, updateTenantPlanBySubscription } = require('./billing.helpers');

async function getGatewayConfig(provider) {
  const config = await prisma.paymentGatewayConfig.findUnique({ where: { provider } });
  if (!config || !config.enabled) {
    throw new AppError(`Gateway ${provider} nao esta ativo`, 400);
  }
  return config;
}

async function getPremiumBillingPlan(billingCycle) {
  const plan = await prisma.billingPlan.findUnique({
    where: {
      plan_billingCycle: {
        plan: 'PREMIUM',
        billingCycle
      }
    }
  });

  if (!plan || !plan.active) {
    throw new AppError('Plano Premium nao esta configurado para este ciclo', 400);
  }

  return plan;
}

async function resolveProvider(billingCycle, requestedProvider) {
  const plan = await getPremiumBillingPlan(billingCycle);

  if (requestedProvider) {
    if (!plan.allowProviderSelection && plan.defaultProvider && requestedProvider !== plan.defaultProvider) {
      throw new AppError('A escolha de gateway esta desabilitada para este checkout', 400);
    }

    return { provider: requestedProvider, plan };
  }

  if (plan.defaultProvider) {
    return { provider: plan.defaultProvider, plan };
  }

  const activeConfig = await prisma.paymentGatewayConfig.findFirst({
    where: { enabled: true },
    orderBy: { provider: 'asc' }
  });

  if (!activeConfig) {
    throw new AppError('Nenhum gateway de pagamento ativo encontrado', 400);
  }

  return { provider: activeConfig.provider, plan };
}

async function createCheckout({ tenant, user, billingCycle, provider }) {
  const latestSubscription = await getLatestTenantSubscription(tenant.id);
  if (latestSubscription?.plan === 'PREMIUM' && ['ACTIVE', 'TRIAL', 'PAST_DUE', 'PENDING'].includes(latestSubscription.status)) {
    throw new AppError('Este workspace ja possui uma assinatura Premium em andamento.', 409);
  }

  const resolved = await resolveProvider(billingCycle, provider);
  const config = await getGatewayConfig(resolved.provider);

  const subscription = await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      provider: resolved.provider,
      status: 'PENDING',
      plan: 'PREMIUM',
      billingCycle
    }
  });

  let checkoutResult;
  if (resolved.provider === 'STRIPE') {
    checkoutResult = await stripeBillingService.createCheckoutSession({
      config,
      tenant,
      user,
      billingCycle,
      subscription,
      billingPlan: resolved.plan
    });
  } else {
    checkoutResult = await mercadoPagoBillingService.createCheckoutSession({
      config,
      tenant,
      user,
      billingCycle,
      subscription,
      billingPlan: resolved.plan
    });
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      externalCustomerId: checkoutResult.externalCustomerId || undefined,
      externalSubscriptionId: checkoutResult.externalSubscriptionId || undefined,
      externalCheckoutSessionId: checkoutResult.externalCheckoutSessionId || undefined
    }
  });

  return {
    checkoutUrl: checkoutResult.checkoutUrl,
    provider: resolved.provider,
    status: 'PENDING'
  };
}

async function getCurrentSubscription(tenantId) {
  const subscription = await getLatestTenantSubscription(tenantId);
  return sanitizeSubscription(subscription);
}

async function getBillingCatalog() {
  const [plans, gateways] = await Promise.all([
    prisma.billingPlan.findMany({
      where: { plan: 'PREMIUM', active: true },
      orderBy: { billingCycle: 'asc' }
    }),
    prisma.paymentGatewayConfig.findMany({
      where: { enabled: true },
      orderBy: { provider: 'asc' },
      select: { provider: true, environment: true }
    })
  ]);

  return {
    plans: plans.map((plan) => ({
      billingCycle: plan.billingCycle,
      currency: plan.currency,
      amount: Number(plan.amount),
      defaultProvider: plan.defaultProvider,
      allowProviderSelection: plan.allowProviderSelection
    })),
    gateways
  };
}

async function createCustomerPortal(tenantId) {
  const subscription = await getLatestTenantSubscription(tenantId);
  if (!subscription || subscription.provider !== 'STRIPE') {
    return {
      available: false,
      message: 'Portal do cliente indisponivel para este provedor no momento.'
    };
  }

  const config = await prisma.paymentGatewayConfig.findUnique({ where: { provider: 'STRIPE' } });
  const session = await stripeBillingService.createCustomerPortal({ config, subscription });

  return {
    available: true,
    url: session.url
  };
}

async function createEventLog(provider, externalEventId, eventType, payload, tenantId = null, subscriptionId = null) {
  return prisma.paymentEventLog.upsert({
    where: {
      provider_externalEventId: {
        provider,
        externalEventId
      }
    },
    create: {
      provider,
      externalEventId,
      eventType,
      payload,
      tenantId,
      subscriptionId
    },
    update: {
      eventType,
      payload,
      tenantId,
      subscriptionId
    }
  });
}

async function markEventLogProcessed(id, errorMessage = null) {
  return prisma.paymentEventLog.update({
    where: { id },
    data: {
      processed: !errorMessage,
      errorMessage
    }
  });
}

async function syncSubscriptionState(subscriptionId, data, reason) {
  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data
  });

  await updateTenantPlanBySubscription(subscription, reason);
  return subscription;
}

async function processStripeWebhookEvent(event) {
  const object = event.data?.object || {};
  const metadata = object.metadata || {};
  const subscriptionId = metadata.subscriptionId || null;
  const tenantId = metadata.tenantId || object.client_reference_id || null;
  const log = await createEventLog('STRIPE', event.id, event.type, event, tenantId, subscriptionId);

  if (log.processed) {
    return { duplicate: true };
  }

  try {
    if (event.type === 'checkout.session.completed' && subscriptionId) {
      await syncSubscriptionState(subscriptionId, {
        externalCustomerId: object.customer ? String(object.customer) : undefined,
        externalSubscriptionId: object.subscription ? String(object.subscription) : undefined,
        externalCheckoutSessionId: object.id,
        status: object.payment_status === 'paid' ? 'ACTIVE' : 'PENDING'
      }, event.type);
    }

    if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      const targetSubscription = await prisma.subscription.findFirst({
        where: {
          OR: [
            { externalSubscriptionId: object.id },
            subscriptionId ? { id: subscriptionId } : undefined
          ].filter(Boolean)
        }
      });

      if (targetSubscription) {
        const mappedStatus = object.status === 'active'
          ? 'ACTIVE'
          : object.status === 'trialing'
            ? 'TRIAL'
            : object.status === 'past_due'
              ? 'PAST_DUE'
              : object.status === 'canceled'
                ? 'CANCELED'
                : 'PENDING';

        await syncSubscriptionState(targetSubscription.id, {
          externalCustomerId: object.customer ? String(object.customer) : undefined,
          externalSubscriptionId: object.id,
          status: mappedStatus,
          currentPeriodStart: normalizeDate(object.current_period_start ? object.current_period_start * 1000 : null),
          currentPeriodEnd: normalizeDate(object.current_period_end ? object.current_period_end * 1000 : null),
          cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
          canceledAt: normalizeDate(object.canceled_at ? object.canceled_at * 1000 : null),
          trialEndsAt: normalizeDate(object.trial_end ? object.trial_end * 1000 : null)
        }, event.type);
      }
    }

    if (event.type === 'invoice.paid') {
      const targetSubscription = await prisma.subscription.findFirst({
        where: { externalSubscriptionId: object.subscription ? String(object.subscription) : '' }
      });

      if (targetSubscription) {
        await syncSubscriptionState(targetSubscription.id, { status: 'ACTIVE' }, event.type);
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const targetSubscription = await prisma.subscription.findFirst({
        where: { externalSubscriptionId: object.subscription ? String(object.subscription) : '' }
      });

      if (targetSubscription) {
        await syncSubscriptionState(targetSubscription.id, { status: 'PAST_DUE' }, event.type);
      }
    }

    await markEventLogProcessed(log.id, null);
    return { processed: true };
  } catch (error) {
    await markEventLogProcessed(log.id, error.message);
    throw error;
  }
}

async function processMercadoPagoWebhook({ eventType, externalEventId, payload, resource }) {
  const externalReference = resource?.external_reference;
  let parsedReference = {};

  if (externalReference) {
    try {
      parsedReference = JSON.parse(externalReference);
    } catch {
      parsedReference = {};
    }
  }

  const tenantId = parsedReference.tenantId || null;
  const subscriptionId = parsedReference.subscriptionId || null;
  const log = await createEventLog('MERCADO_PAGO', externalEventId, eventType, payload, tenantId, subscriptionId);

  if (log.processed) {
    return { duplicate: true };
  }

  try {
    const targetSubscription = subscriptionId
      ? await prisma.subscription.findUnique({ where: { id: subscriptionId } })
      : await prisma.subscription.findFirst({ where: { externalSubscriptionId: resource?.id ? String(resource.id) : undefined } });

    if (targetSubscription) {
      const mpStatus = String(resource?.status || resource?.status_detail || '').toLowerCase();
      const mappedStatus = mpStatus === 'authorized' || mpStatus === 'approved'
        ? 'ACTIVE'
        : mpStatus === 'pending'
          ? 'PENDING'
          : mpStatus === 'cancelled' || mpStatus === 'cancelled_by_user' || mpStatus === 'cancelled_by_admin'
            ? 'CANCELED'
            : mpStatus === 'rejected' || mpStatus === 'charged_back' || mpStatus === 'refunded'
              ? 'FAILED'
              : 'PENDING';

      await syncSubscriptionState(targetSubscription.id, {
        externalCustomerId: resource?.payer_id ? String(resource.payer_id) : undefined,
        externalSubscriptionId: resource?.id ? String(resource.id) : targetSubscription.externalSubscriptionId,
        status: mappedStatus,
        currentPeriodStart: normalizeDate(resource?.date_created),
        currentPeriodEnd: normalizeDate(resource?.next_payment_date),
        canceledAt: normalizeDate(resource?.date_last_updated && mappedStatus === 'CANCELED' ? resource.date_last_updated : null)
      }, eventType);
    }

    await markEventLogProcessed(log.id, null);
    return { processed: true };
  } catch (error) {
    await markEventLogProcessed(log.id, error.message);
    throw error;
  }
}

async function listPaymentEvents(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.provider) where.provider = filters.provider;
  if (filters.eventType) where.eventType = { contains: filters.eventType, mode: 'insensitive' };
  if (filters.processed !== undefined) where.processed = filters.processed;
  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const [data, total] = await Promise.all([
    prisma.paymentEventLog.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true } },
        subscription: { select: { id: true, status: true, plan: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.paymentEventLog.count({ where })
  ]);

  return {
    data: data.map((item) => ({
      id: item.id,
      provider: item.provider,
      eventType: item.eventType,
      externalEventId: item.externalEventId,
      tenant: item.tenant,
      subscription: item.subscription,
      processed: item.processed,
      errorMessage: item.errorMessage,
      createdAt: item.createdAt.toISOString()
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

module.exports = {
  createCheckout,
  getCurrentSubscription,
  getBillingCatalog,
  createCustomerPortal,
  getGatewayConfig,
  processStripeWebhookEvent,
  processMercadoPagoWebhook,
  listPaymentEvents
};
