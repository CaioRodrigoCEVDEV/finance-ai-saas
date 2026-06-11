const { z } = require('zod');
const AppError = require('../../utils/app-error');
const { idSchema } = require('../../validators/common.schema');

function normalizeOptionalUuid(value) {
  if (value === '' || value === null || value === undefined || value === 'null' || value === 'undefined') return undefined;
  if (typeof value === 'string' && value.trim().length === 0) return undefined;
  return typeof value === 'string' ? value.trim() : undefined;
}

function normalizeOptionalNumber(value) {
  if (value === '' || value === undefined || value === null) return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) return undefined;
  return num;
}

function normalizeOptionalInteger(value) {
  if (value === '' || value === undefined || value === null) return undefined;
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return undefined;
  return num;
}

function normalizeOptionalDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function buildValidator(schema, target) {
  return (request, _response, next) => {
    try {
      const parsed = schema.parse(request[target]);
      request[target] = parsed;
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        return next(new AppError(message, 400));
      }
      return next(error);
    }
  };
}

const generateSchema = z.object({
  creditCardId: z.preprocess(normalizeOptionalUuid, z.string().uuid('ID do cartão inválido')),
  referenceMonth: z.preprocess(normalizeOptionalInteger, z.number().int().min(1).max(12)),
  referenceYear: z.preprocess(normalizeOptionalInteger, z.number().int().min(2000).max(2100))
});

const listQuerySchema = z.object({
  creditCardId: z.preprocess(normalizeOptionalUuid, z.string().uuid().optional()),
  year: z.preprocess(normalizeOptionalInteger, z.number().int().min(2000).max(2100).optional()),
  month: z.preprocess(normalizeOptionalInteger, z.number().int().min(1).max(12).optional()),
  status: z.string().optional()
}).strict();

const paramsSchema = z.object({
  id: idSchema
});

const paySchema = z.object({
  accountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('ID da conta inválido')),
  paymentDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data de pagamento obrigatória' })),
  amount: z.preprocess(
    normalizeOptionalNumber,
    z.number().positive('Valor deve ser maior que zero').optional()
  ),
  notes: z.string().optional().nullable()
});

const validateListQuery = buildValidator(listQuerySchema, 'query');
const validateParams = buildValidator(paramsSchema, 'params');
const validateGenerate = buildValidator(generateSchema, 'body');
const validatePay = buildValidator(paySchema, 'body');

module.exports = {
  validateListQuery,
  validateParams,
  validateGenerate,
  validatePay
};
