const { z } = require('zod');

const AppError = require('../../utils/app-error');
const { parseLocalDate } = require('../../utils/date-utils');

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeNullableText(value) {
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

function normalizeOptionalDate(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const date = parseLocalDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return Number.NaN;
  }

  return date;
}

function normalizeNullableDate(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const date = parseLocalDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return Number.NaN;
  }

  return date;
}

const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
  message: 'Prioridade deve ser LOW, MEDIUM, HIGH ou URGENT'
});

const taskStatusEnum = z.enum(['PENDING', 'COMPLETED'], {
  message: 'Status deve ser PENDING ou COMPLETED'
});

const checklistCreateItemSchema = z.object({
  title: z.string().trim().min(1, 'Titulo do item obrigatorio'),
  completed: z.boolean().optional(),
  order: z.preprocess(normalizeOptionalNumber, z.number().int().min(0).optional())
});

const checklistUpdateItemSchema = checklistCreateItemSchema.extend({
  id: z.preprocess(normalizeOptionalText, z.string().uuid('Identificador de item invalido').optional())
});

const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Titulo deve ter no minimo 2 caracteres'),
  description: z.preprocess(normalizeNullableText, z.string().trim().nullable().optional()),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.preprocess(normalizeNullableDate, z.date().nullable().optional()),
  checklist: z.array(checklistCreateItemSchema).optional()
});

const updateTaskSchema = z.object({
  title: z.preprocess(normalizeOptionalText, z.string().trim().min(2, 'Titulo deve ter no minimo 2 caracteres').optional()),
  description: z.preprocess(normalizeNullableText, z.string().trim().nullable().optional()),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.preprocess(normalizeNullableDate, z.date().nullable().optional()),
  checklist: z.array(checklistUpdateItemSchema).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const taskParamsSchema = z.object({
  id: z.string().uuid('Identificador de tarefa invalido')
});

const listTasksQuerySchema = z.object({
  page: z.preprocess(normalizeOptionalNumber, z.number().int().min(1).default(1)),
  limit: z.preprocess(normalizeOptionalNumber, z.number().int().min(1).max(100).default(20)),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.preprocess(normalizeOptionalDate, z.date().optional()),
  dueDateGte: z.preprocess(normalizeOptionalDate, z.date().optional()),
  dueDateLte: z.preprocess(normalizeOptionalDate, z.date().optional()),
  overdue: z.preprocess(
    (value) => value === 'true' || value === true ? 'true' : undefined,
    z.enum(['true']).optional()
  ),
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
  validateCreateTask: buildValidator(createTaskSchema, 'body'),
  validateUpdateTask: buildValidator(updateTaskSchema, 'body'),
  validateTaskParams: buildValidator(taskParamsSchema, 'params'),
  validateListTasksQuery: buildValidator(listTasksQuerySchema, 'query')
};
