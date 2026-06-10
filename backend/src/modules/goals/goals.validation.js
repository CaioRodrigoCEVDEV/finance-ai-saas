const { z } = require('zod');

const AppError = require('../../utils/app-error');

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
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

function normalizeOptionalDate(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return Number.NaN;
  }

  return date;
}

const goalStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'CANCELED'], {
  message: 'Status deve ser ACTIVE, COMPLETED ou CANCELED'
});

const createGoalSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres'),
  description: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  targetAmount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor alvo deve ser maior que zero')),
  currentAmount: z.preprocess(normalizeOptionalNumber, z.number().min(0, 'Valor atual nao pode ser negativo').optional()),
  deadline: z.preprocess(normalizeOptionalDate, z.date().optional()),
  status: goalStatusEnum.optional()
});

const updateGoalSchema = z.object({
  name: z.preprocess(normalizeOptionalText, z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres').optional()),
  description: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  targetAmount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor alvo deve ser maior que zero').optional()),
  currentAmount: z.preprocess(normalizeOptionalNumber, z.number().min(0, 'Valor atual nao pode ser negativo').optional()),
  deadline: z.preprocess(normalizeOptionalDate, z.date().optional()),
  status: goalStatusEnum.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const updateGoalProgressSchema = z.object({
  currentAmount: z.preprocess(normalizeOptionalNumber, z.number().min(0, 'Valor atual nao pode ser negativo'))
});

const goalParamsSchema = z.object({
  id: z.string().uuid('Identificador de meta invalido')
});

const listGoalsQuerySchema = z.object({
  status: goalStatusEnum.optional(),
  search: z.preprocess(normalizeOptionalText, z.string().trim().optional())
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
  validateCreateGoal: buildValidator(createGoalSchema, 'body'),
  validateUpdateGoal: buildValidator(updateGoalSchema, 'body'),
  validateUpdateGoalProgress: buildValidator(updateGoalProgressSchema, 'body'),
  validateGoalParams: buildValidator(goalParamsSchema, 'params'),
  validateListGoalsQuery: buildValidator(listGoalsQuerySchema, 'query')
};
