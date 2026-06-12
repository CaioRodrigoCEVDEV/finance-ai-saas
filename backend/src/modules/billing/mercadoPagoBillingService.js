const AppError = require('../../utils/app-error');
const { decryptSecret } = require('./billing-secret.helper');

function getAccessToken(config) {
  const accessToken = decryptSecret(config?.secretKeyEncrypted);
  if (!accessToken) {
    throw new AppError('Mercado Pago nao configurado com access token', 400);
  }

  return accessToken;
}

async function mercadoPagoRequest(config, path, options = {}) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${getAccessToken(config)}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AppError(json?.message || 'Falha ao comunicar com o Mercado Pago', 400);
  }

  return json;
}

async function testCredentials(config) {
  const me = await mercadoPagoRequest(config, '/users/me');

  return {
    success: true,
    message: 'Credenciais do Mercado Pago validadas com sucesso.',
    userId: String(me.id)
  };
}

async function createCheckoutSession({ config, tenant, user, billingCycle, subscription }) {
  const planId = billingCycle === 'YEARLY' ? config.yearlyPlanExternalId : config.monthlyPlanExternalId;

  if (!planId) {
    throw new AppError('Plano externo do Mercado Pago nao configurado para este ciclo', 400);
  }

  const preapproval = await mercadoPagoRequest(config, '/preapproval', {
    method: 'POST',
    body: {
      preapproval_plan_id: planId,
      reason: `Finance AI Premium ${billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}`,
      payer_email: user.email,
      back_url: config.successUrl,
      status: 'pending',
      external_reference: JSON.stringify({
        tenantId: tenant.id,
        subscriptionId: subscription.id,
        billingCycle
      })
    }
  });

  return {
    externalCustomerId: preapproval.payer_id ? String(preapproval.payer_id) : null,
    externalCheckoutSessionId: preapproval.id,
    externalSubscriptionId: preapproval.id,
    checkoutUrl: preapproval.init_point || preapproval.sandbox_init_point || preapproval.auto_recurring?.init_point
  };
}

async function fetchResource(config, topic, resourceId) {
  if (!resourceId) {
    return null;
  }

  const normalizedTopic = String(topic || '').toLowerCase();

  if (normalizedTopic.includes('preapproval') || normalizedTopic.includes('subscription')) {
    return mercadoPagoRequest(config, `/preapproval/${resourceId}`);
  }

  if (normalizedTopic.includes('payment')) {
    return mercadoPagoRequest(config, `/v1/payments/${resourceId}`);
  }

  return null;
}

module.exports = {
  testCredentials,
  createCheckoutSession,
  fetchResource
};
