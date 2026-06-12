const { z } = require('zod');

const AppError = require('../../utils/app-error');

const providerEnum = z.enum(['STRIPE', 'MERCADO_PAGO']);
const environmentEnum = z.enum(['SANDBOX', 'PRODUCTION']);
const emptyStringToNull = (value) => {
  if (value === '' || value === undefined) {
    return null;
  }

  return value;
};
const nullableString = z.preprocess(emptyStringToNull, z.string().trim().nullable().optional());
const nullableUrl = z.preprocess(emptyStringToNull, z.string().url().nullable().optional());
const processedBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return String(value).toLowerCase() === 'true';
}, z.boolean().optional());

function buildValidator(schema, target) {
  return function validate(request, _response, next) {
    const parsedData = schema.safeParse(request[target]);

    if (!parsedData.success) {
      return next(new AppError(parsedData.error.issues[0]?.message || 'Dados invalidos', 400));
    }

    request[target] = parsedData.data;
    return next();
  };
}

const baseGatewaySchema = z.object({
  enabled: z.boolean(),
  environment: environmentEnum,
  publicKey: nullableString,
  webhookSecret: nullableString,
  monthlyPlanExternalId: nullableString,
  yearlyPlanExternalId: nullableString,
  successUrl: nullableUrl,
  cancelUrl: nullableUrl,
  failureUrl: nullableUrl,
  pendingUrl: nullableUrl,
  webhookUrl: nullableUrl
});

const stripeSchema = baseGatewaySchema.extend({
  secretKey: nullableString
});

const mercadoPagoSchema = baseGatewaySchema.extend({
  secretKey: nullableString,
  accessToken: nullableString
}).transform((data) => ({
  ...data,
  secretKey: data.accessToken || data.secretKey || null
}));

const plansSchema = z.object({
  monthlyAmount: z.coerce.number().nonnegative(),
  yearlyAmount: z.coerce.number().nonnegative(),
  currency: z.enum(['BRL', 'USD']),
  defaultProvider: providerEnum,
  allowProviderSelection: z.boolean()
});

const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  provider: providerEnum.optional(),
  eventType: z.string().optional(),
  processed: processedBoolean,
  tenantId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

module.exports = {
  validateStripeSettings: buildValidator(stripeSchema, 'body'),
  validateMercadoPagoSettings: buildValidator(mercadoPagoSchema, 'body'),
  validateBillingPlans: buildValidator(plansSchema, 'body'),
  validatePaymentEventsQuery: buildValidator(eventQuerySchema, 'query')
};
