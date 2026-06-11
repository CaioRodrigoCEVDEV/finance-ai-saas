const { z } = require('zod');

const AppError = require('../../utils/app-error');

const notificationTypeEnum = z.enum([
  'BUDGET_WARNING',
  'BUDGET_EXCEEDED',
  'UNCATEGORIZED_TRANSACTIONS',
  'GOAL_COMPLETED',
  'CREDIT_CARD_LIMIT'
], {
  message: 'Tipo de notificacao invalido'
});

const notificationParamsSchema = z.object({
  id: z.string().uuid('Identificador de notificacao invalido')
});

const listNotificationsQuerySchema = z.object({
  page: z
    .preprocess(
      (value) => (value === undefined || value === null || value === '' ? undefined : Number(value)),
      z.number().int().min(1).optional().default(1)
    ),
  limit: z
    .preprocess(
      (value) => (value === undefined || value === null || value === '' ? undefined : Number(value)),
      z.number().int().min(1).max(50).optional().default(20)
    ),
  isRead: z
    .preprocess(
      (value) => {
        if (value === undefined || value === null || value === '') return undefined;
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
      },
      z.boolean().optional()
    ),
  type: notificationTypeEnum.optional()
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
  validateNotificationParams: buildValidator(notificationParamsSchema, 'params'),
  validateListNotificationsQuery: buildValidator(listNotificationsQuerySchema, 'query')
};
