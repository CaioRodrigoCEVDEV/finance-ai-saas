const { z } = require('zod');

const AppError = require('../../utils/app-error');

const MATCH_TYPES = ['CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'EQUALS', 'REGEX'];

function normalizeActive(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }

  return undefined;
}

const querySchema = z.object({
  active: z.preprocess(normalizeActive, z.boolean().optional()),
  search: z.string().trim().optional()
});

const paramsSchema = z.object({
  id: z.string().uuid('Identificador de regra invalido')
});

const createSchema = z.object({
  name: z.string().trim().min(1, 'Nome e obrigatorio'),
  matchText: z.string().trim().min(2, 'Texto de correspondencia deve ter no minimo 2 caracteres'),
  matchType: z.enum(MATCH_TYPES, { message: 'Tipo de correspondencia invalido' }),
  categoryId: z.string().uuid('Identificador de categoria invalido'),
  priority: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional()
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  matchText: z.string().trim().min(2, 'Texto de correspondencia deve ter no minimo 2 caracteres').optional(),
  matchType: z.enum(MATCH_TYPES, { message: 'Tipo de correspondencia invalido' }).optional(),
  categoryId: z.string().uuid('Identificador de categoria invalido').optional(),
  priority: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const testSchema = z.object({
  description: z.string().trim().min(1, 'Descricao e obrigatoria')
});

const applySchema = z.object({
  onlyWithoutCategory: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
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
  validateQuery: buildValidator(querySchema, 'query'),
  validateParams: buildValidator(paramsSchema, 'params'),
  validateCreate: buildValidator(createSchema, 'body'),
  validateUpdate: buildValidator(updateSchema, 'body'),
  validateTest: buildValidator(testSchema, 'body'),
  validateApply: buildValidator(applySchema, 'body')
};
