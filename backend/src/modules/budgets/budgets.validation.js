const { z } = require('zod');

const AppError = require('../../utils/app-error');

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  return String(value).trim();
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

const budgetBodyFields = {
  name: z.preprocess(normalizeOptionalText, z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres')),
  categoryId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Categoria invalida')),
  amount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor deve ser maior que zero')),
  month: z.preprocess(normalizeOptionalInteger, z.number().int('Mes invalido').min(1, 'Mes invalido').max(12, 'Mes invalido')),
  year: z.preprocess(normalizeOptionalInteger, z.number().int('Ano invalido').min(2000, 'Ano invalido').max(2100, 'Ano invalido'))
};

const createBudgetSchema = z.object(budgetBodyFields);

const updateBudgetSchema = z.object(budgetBodyFields).partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const budgetParamsSchema = z.object({
  id: z.string().uuid('Identificador de orcamento invalido')
});

const listBudgetsQuerySchema = z.object({
  month: z.preprocess(normalizeOptionalInteger, z.number().int('Mes invalido').min(1, 'Mes invalido').max(12, 'Mes invalido').optional()),
  year: z.preprocess(normalizeOptionalInteger, z.number().int('Ano invalido').min(2000, 'Ano invalido').max(2100, 'Ano invalido').optional()),
  categoryId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Categoria invalida').optional())
});

const monthSummaryQuerySchema = z.object({
  month: z.preprocess(normalizeOptionalInteger, z.number().int('Mes invalido').min(1, 'Mes invalido').max(12, 'Mes invalido').optional()),
  year: z.preprocess(normalizeOptionalInteger, z.number().int('Ano invalido').min(2000, 'Ano invalido').max(2100, 'Ano invalido').optional())
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
  validateCreateBudget: buildValidator(createBudgetSchema, 'body'),
  validateUpdateBudget: buildValidator(updateBudgetSchema, 'body'),
  validateBudgetParams: buildValidator(budgetParamsSchema, 'params'),
  validateListBudgetsQuery: buildValidator(listBudgetsQuerySchema, 'query'),
  validateBudgetMonthSummaryQuery: buildValidator(monthSummaryQuerySchema, 'query')
};
