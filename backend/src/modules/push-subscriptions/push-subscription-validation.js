const { z } = require('zod');
const AppError = require('../../utils/app-error');

const subscribeSchema = z.object({
  endpoint: z.string().url('Endpoint invalido'),
  keys: z.object({
    p256dh: z.string().min(1, 'Chave p256dh obrigatoria'),
    auth: z.string().min(1, 'Chave auth obrigatoria')
  })
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url('Endpoint invalido')
});

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

module.exports = {
  validateSubscribe: buildValidator(subscribeSchema, 'body'),
  validateUnsubscribe: buildValidator(unsubscribeSchema, 'body')
};
