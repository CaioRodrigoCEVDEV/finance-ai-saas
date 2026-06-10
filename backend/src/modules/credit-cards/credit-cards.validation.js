const { z } = require('zod');

const AppError = require('../../utils/app-error');

const CREDIT_CARD_BRANDS = ['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD', 'OTHER'];

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeNullableUuid(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return Number.NaN;
  }

  return numericValue;
}

function normalizeOptionalInteger(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue)) {
    return Number.NaN;
  }

  return numericValue;
}

function normalizeOptionalBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  return undefined;
}

const creditCardBodyFields = {
  name: z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres'),
  brand: z.preprocess(normalizeOptionalText, z.enum(CREDIT_CARD_BRANDS).nullable().optional()),
  limitAmount: z.preprocess(normalizeOptionalNumber, z.number().min(0, 'Limite deve ser maior ou igual a zero')),
  closingDay: z.preprocess(normalizeOptionalInteger, z.number().int('Dia de fechamento invalido').min(1, 'Dia de fechamento deve estar entre 1 e 31').max(31, 'Dia de fechamento deve estar entre 1 e 31')),
  dueDay: z.preprocess(normalizeOptionalInteger, z.number().int('Dia de vencimento invalido').min(1, 'Dia de vencimento deve estar entre 1 e 31').max(31, 'Dia de vencimento deve estar entre 1 e 31')),
  accountId: z.preprocess(normalizeNullableUuid, z.string().uuid('Conta vinculada invalida').nullable().optional()),
  color: z.preprocess(normalizeOptionalText, z.string().max(30, 'Cor deve ter no maximo 30 caracteres').nullable().optional()),
  isActive: z.preprocess(normalizeOptionalBoolean, z.boolean().optional())
};

const createCreditCardSchema = z.object({
  ...creditCardBodyFields,
  isActive: z.preprocess(normalizeOptionalBoolean, z.boolean().default(true))
});

const updateCreditCardSchema = z.object(creditCardBodyFields).partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const creditCardParamsSchema = z.object({
  id: z.string().uuid('Identificador de cartao invalido')
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
  validateCreateCreditCard: buildValidator(createCreditCardSchema, 'body'),
  validateUpdateCreditCard: buildValidator(updateCreditCardSchema, 'body'),
  validateCreditCardParams: buildValidator(creditCardParamsSchema, 'params')
};
