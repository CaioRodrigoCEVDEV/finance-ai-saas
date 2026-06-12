const { createAuditLog } = require('../../middlewares/audit-log');
const paymentSettingsService = require('./paymentSettings.service');
const billingService = require('../billing/billing.service');

async function getPaymentSettings(request, response, next) {
  try {
    const data = await paymentSettingsService.getPaymentSettings();
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateStripeSettings(request, response, next) {
  try {
    const data = await paymentSettingsService.updateGateway('STRIPE', request.body);
    await createAuditLog('ADMIN_UPDATE_PAYMENT_GATEWAY', 'payment_gateway', 'STRIPE', { provider: 'STRIPE', ...request.body, secretKey: undefined, webhookSecret: undefined }, request);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateMercadoPagoSettings(request, response, next) {
  try {
    const data = await paymentSettingsService.updateGateway('MERCADO_PAGO', request.body);
    await createAuditLog('ADMIN_UPDATE_PAYMENT_GATEWAY', 'payment_gateway', 'MERCADO_PAGO', { provider: 'MERCADO_PAGO', ...request.body, accessToken: undefined, webhookSecret: undefined }, request);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function testStripeSettings(request, response, next) {
  try {
    const data = await paymentSettingsService.testGateway('STRIPE');
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function testMercadoPagoSettings(request, response, next) {
  try {
    const data = await paymentSettingsService.testGateway('MERCADO_PAGO');
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateBillingPlans(request, response, next) {
  try {
    const data = await paymentSettingsService.updatePlans(request.body);
    await createAuditLog('ADMIN_UPDATE_BILLING_PLANS', 'billing_plan', 'PREMIUM', request.body, request);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function listPaymentEvents(request, response, next) {
  try {
    const data = await billingService.listPaymentEvents(request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPaymentSettings,
  updateStripeSettings,
  updateMercadoPagoSettings,
  testStripeSettings,
  testMercadoPagoSettings,
  updateBillingPlans,
  listPaymentEvents
};
