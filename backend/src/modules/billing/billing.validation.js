const { z } = require('zod');

const AppError = require('../../utils/app-error');

const billingCycleEnum = z.enum(['MONTHLY', 'YEARLY']);
const providerEnum = z.enum(['STRIPE', 'MERCADO_PAGO']);

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

const checkoutSchema = z.object({
  billingCycle: billingCycleEnum,
  provider: providerEnum.optional()
});

module.exports = {
  validateCheckout: buildValidator(checkoutSchema, 'body')
};
