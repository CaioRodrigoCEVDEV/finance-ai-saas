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

const monthQuerySchema = z.object({
  year: z.preprocess(
    normalizeOptionalNumber,
    z.number().int('Ano deve ser um numero inteiro')
      .min(2000, 'Ano deve ser entre 2000 e 2100')
      .max(2100, 'Ano deve ser entre 2000 e 2100')
  ),
  month: z.preprocess(
    normalizeOptionalNumber,
    z.number().int('Mes deve ser um numero inteiro')
      .min(1, 'Mes deve ser entre 1 e 12')
      .max(12, 'Mes deve ser entre 1 e 12')
  )
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
  monthQuerySchema,
  validateMonthQuery: buildValidator(monthQuerySchema, 'query')
};
