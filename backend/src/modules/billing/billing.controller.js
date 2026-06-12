const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const billingService = require('./billing.service');
const stripeBillingService = require('./stripeBillingService');
const mercadoPagoBillingService = require('./mercadoPagoBillingService');

async function checkout(request, response, next) {
  try {
    const data = await billingService.createCheckout({
      tenant: request.tenant,
      user: request.user,
      billingCycle: request.body.billingCycle,
      provider: request.body.provider
    });

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getCurrent(request, response, next) {
  try {
    const data = await billingService.getCurrentSubscription(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getPlans(request, response, next) {
  try {
    const data = await billingService.getBillingCatalog();
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function customerPortal(request, response, next) {
  try {
    const data = await billingService.createCustomerPortal(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function stripeWebhook(request, response, next) {
  try {
    const config = await prisma.paymentGatewayConfig.findUnique({ where: { provider: 'STRIPE' } });
    if (!config?.enabled) {
      throw new AppError('Stripe webhook indisponivel', 404);
    }

    const signature = request.get('stripe-signature');
    const event = stripeBillingService.constructWebhookEvent(config, request.body, signature);
    await billingService.processStripeWebhookEvent(event);

    return response.json({ received: true });
  } catch (error) {
    return next(error);
  }
}

async function mercadoPagoWebhook(request, response, next) {
  try {
    const config = await prisma.paymentGatewayConfig.findUnique({ where: { provider: 'MERCADO_PAGO' } });
    if (!config?.enabled) {
      throw new AppError('Mercado Pago webhook indisponivel', 404);
    }

    const payload = request.body || {};
    const topic = request.query.topic || payload.type || payload.topic || payload.action;
    const resourceId = payload.data?.id || payload.id;
    const resource = await mercadoPagoBillingService.fetchResource(config, topic, resourceId);

    await billingService.processMercadoPagoWebhook({
      eventType: String(topic || 'mercado-pago.event'),
      externalEventId: String(payload.id || resourceId || Date.now()),
      payload,
      resource
    });

    return response.json({ received: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  checkout,
  getCurrent,
  getPlans,
  customerPortal,
  stripeWebhook,
  mercadoPagoWebhook
};
