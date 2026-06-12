const Stripe = require('stripe');

const AppError = require('../../utils/app-error');
const { decryptSecret } = require('./billing-secret.helper');

function getStripeClient(config) {
  const secretKey = decryptSecret(config?.secretKeyEncrypted);
  if (!secretKey) {
    throw new AppError('Stripe nao configurado com secret key', 400);
  }

  return new Stripe(secretKey);
}

async function testCredentials(config) {
  const stripe = getStripeClient(config);
  const account = await stripe.accounts.retrieve();

  return {
    success: true,
    message: 'Credenciais do Stripe validadas com sucesso.',
    accountId: account.id
  };
}

async function createCheckoutSession({ config, tenant, user, billingCycle, subscription, billingPlan }) {
  const stripe = getStripeClient(config);
  const priceId = billingCycle === 'YEARLY' ? config.yearlyPlanExternalId : config.monthlyPlanExternalId;

  if (!priceId) {
    throw new AppError('Price ID do Stripe nao configurado para este ciclo', 400);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: config.successUrl,
    cancel_url: config.cancelUrl,
    customer_email: user.email,
    metadata: {
      tenantId: tenant.id,
      subscriptionId: subscription.id,
      billingCycle,
      plan: 'PREMIUM'
    },
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    client_reference_id: tenant.id,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        tenantId: tenant.id,
        subscriptionId: subscription.id,
        billingCycle,
        plan: billingPlan.plan
      }
    }
  });

  return {
    externalCustomerId: session.customer ? String(session.customer) : null,
    externalCheckoutSessionId: session.id,
    checkoutUrl: session.url
  };
}

async function createCustomerPortal({ config, subscription }) {
  const stripe = getStripeClient(config);

  if (!subscription?.externalCustomerId) {
    throw new AppError('Nao existe cliente Stripe vinculado a esta assinatura.', 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.externalCustomerId,
    return_url: config.successUrl || config.cancelUrl
  });

  return {
    url: session.url
  };
}

function constructWebhookEvent(config, payloadBuffer, signature) {
  const stripe = getStripeClient(config);
  const webhookSecret = decryptSecret(config?.webhookSecretEncrypted);

  if (!webhookSecret) {
    throw new AppError('Webhook secret do Stripe nao configurado', 400);
  }

  return stripe.webhooks.constructEvent(payloadBuffer, signature, webhookSecret);
}

module.exports = {
  testCredentials,
  createCheckoutSession,
  createCustomerPortal,
  constructWebhookEvent
};
