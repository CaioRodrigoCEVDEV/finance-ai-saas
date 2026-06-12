const { z } = require('zod');

const AppError = require('../../utils/app-error');

const HTML_SCRIPT_PATTERN = /<\s*(script|iframe|object|embed|form|input|button|link|style|meta|img|svg|video|audio|source|track|applet|frame|frameset|ilayer|layer|bgsound|base|isindex)\b|<[a-z]+[^>]*on\w+\s*=/i;

const createFeedbackSchema = z.object({
  message: z
    .string({ required_error: 'Mensagem obrigatoria' })
    .trim()
    .min(5, 'Mensagem deve ter no minimo 5 caracteres')
    .max(1000, 'Mensagem deve ter no maximo 1000 caracteres')
    .refine(
      (value) => !HTML_SCRIPT_PATTERN.test(value),
      'Mensagem contem conteudo HTML ou script invalido'
    ),
  pageUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
});

const paramsSchema = z.object({
  id: z.string().uuid('Identificador de feedback invalido')
});

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'])
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
  validateCreateFeedback: buildValidator(createFeedbackSchema, 'body'),
  validateFeedbackParams: buildValidator(paramsSchema, 'params'),
  validateUpdateFeedbackStatus: buildValidator(updateStatusSchema, 'body')
};
