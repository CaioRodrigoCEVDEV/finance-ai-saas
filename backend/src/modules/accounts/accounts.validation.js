const { z } = require('zod');

const AppError = require('../../utils/app-error');

const ACCOUNT_TYPES = ['CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT', 'WALLET', 'OTHER'];

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeCurrency(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return 'BRL';
  }

  return String(value).trim().toUpperCase();
}

function normalizeOptionalDecimal(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return Number.NaN;
  }

  return numericValue;
}

const accountBodyBaseSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres'),
  type: z.enum(ACCOUNT_TYPES),
  bankName: z.preprocess(normalizeOptionalText, z.string().min(1).max(120).nullable().optional()),
  initialBalance: z.preprocess(normalizeOptionalDecimal, z.number().finite('Saldo inicial invalido').optional()),
  currentBalance: z.preprocess(normalizeOptionalDecimal, z.number().finite('Saldo atual invalido').optional()),
  currency: z.preprocess(normalizeCurrency, z.string().length(3, 'Moeda deve ter 3 caracteres').optional()),
  color: z.preprocess(normalizeOptionalText, z.string().max(30).nullable().optional()),
  icon: z.preprocess(normalizeOptionalText, z.string().max(50).nullable().optional()),
  isActive: z.boolean().optional()
});

const createAccountSchema = accountBodyBaseSchema;

const updateAccountSchema = accountBodyBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const paramsSchema = z.object({
  id: z.string().uuid('Identificador de conta invalido')
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
  validateCreateAccount: buildValidator(createAccountSchema, 'body'),
  validateUpdateAccount: buildValidator(updateAccountSchema, 'body'),
  validateAccountParams: buildValidator(paramsSchema, 'params')
};
