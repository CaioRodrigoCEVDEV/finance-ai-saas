const { z } = require('zod');

const AppError = require('../../utils/app-error');

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

const dashboardQuerySchema = z.object({
  month: z.preprocess(
    normalizeOptionalNumber,
    z.number().int('Mês deve ser um número inteiro').min(1, 'Mês deve ser entre 1 e 12').max(12, 'Mês deve ser entre 1 e 12').optional()
  ),
  year: z.preprocess(
    normalizeOptionalNumber,
    z.number().int('Ano deve ser um número inteiro').min(2000, 'Ano deve ser entre 2000 e 3000').max(3000, 'Ano deve ser entre 2000 e 3000').optional()
  )
});

function buildValidator(schema, target) {
  return function validate(request, _response, next) {
    const parsedData = schema.safeParse(request[target]);

    if (!parsedData.success) {
      return next(new AppError(parsedData.error.issues[0]?.message || 'Dados inválidos', 400));
    }

    request[target] = parsedData.data;
    return next();
  };
}

module.exports = {
  dashboardQuerySchema,
  validateDashboardQuery: buildValidator(dashboardQuerySchema, 'query')
};
