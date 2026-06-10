const { z } = require('zod');

const AppError = require('../../utils/app-error');

const CATEGORY_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT'];

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  return String(value).trim();
}

function normalizeIncludeInactive(value) {
  if (value === undefined) {
    return false;
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

const categoryBodyBaseSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres'),
  type: z.enum(CATEGORY_TYPES),
  parentId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Categoria pai invalida').nullable().optional()),
  color: z.preprocess(normalizeOptionalText, z.string().max(30).nullable().optional()),
  icon: z.preprocess(normalizeOptionalText, z.string().max(50).nullable().optional()),
  isActive: z.boolean().optional()
});

const createCategorySchema = categoryBodyBaseSchema;

const updateCategorySchema = categoryBodyBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const paramsSchema = z.object({
  id: z.string().uuid('Identificador de categoria invalido')
});

const querySchema = z.object({
  type: z.enum(CATEGORY_TYPES).optional(),
  includeInactive: z.preprocess(normalizeIncludeInactive, z.boolean({ message: 'includeInactive deve ser true ou false' }))
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
  validateCreateCategory: buildValidator(createCategorySchema, 'body'),
  validateUpdateCategory: buildValidator(updateCategorySchema, 'body'),
  validateCategoryParams: buildValidator(paramsSchema, 'params'),
  validateCategoryQuery: buildValidator(querySchema, 'query')
};
