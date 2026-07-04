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

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  return String(value).trim();
}

const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
  message: 'Prioridade deve ser LOW, MEDIUM, HIGH ou URGENT'
});

const taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
  message: 'Status deve ser PENDING, IN_PROGRESS, COMPLETED ou CANCELLED'
});

const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Titulo deve ter no minimo 2 caracteres'),
  description: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.preprocess(normalizeOptionalDate, z.date().optional()),
  estimatedAmount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor previsto deve ser maior que zero').optional()),
  accountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta invalida').optional()),
  reminderAt: z.preprocess(normalizeOptionalDate, z.date().optional()),
  autoComplete: z.boolean().optional(),
  items: z.array(z.object({
    description: z.string().trim().min(1, 'Descricao do item obrigatoria'),
    completed: z.boolean().optional(),
    order: z.number().int().min(0).optional()
  })).optional()
});

const updateTaskSchema = z.object({
  title: z.preprocess(normalizeOptionalText, z.string().trim().min(2, 'Titulo deve ter no minimo 2 caracteres').optional()),
  description: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.preprocess(normalizeOptionalDate, z.date().optional()),
  estimatedAmount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor previsto deve ser maior que zero').optional()),
  accountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta invalida').optional()),
  reminderAt: z.preprocess(normalizeOptionalDate, z.date().optional()),
  autoComplete: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const generateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], { message: 'Tipo deve ser INCOME ou EXPENSE' }),
  amount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor deve ser maior que zero')),
  accountId: z.string().uuid('Conta invalida'),
  categoryId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Categoria invalida').optional()),
  description: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  transactionDate: z.preprocess(normalizeOptionalDate, z.date().optional())
});

const taskParamsSchema = z.object({
  id: z.string().uuid('Identificador de tarefa invalido')
});

const taskItemParamsSchema = z.object({
  id: z.string().uuid('Identificador de tarefa invalido'),
  itemId: z.string().uuid('Identificador de item invalido')
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

const createItemSchema = z.object({
  description: z.string().trim().min(1, 'Descricao do item obrigatoria')
});

const updateItemSchema = z.object({
  description: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  completed: z.boolean().optional(),
  order: z.number().int().min(0).optional()
});

const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid('Item invalido'),
      order: z.number().int().min(0)
    })
  )
});

module.exports = {
  validateCreateTask: buildValidator(createTaskSchema, 'body'),
  validateUpdateTask: buildValidator(updateTaskSchema, 'body'),
  validateTaskParams: buildValidator(taskParamsSchema, 'params'),
  validateTaskItemParams: buildValidator(taskItemParamsSchema, 'params'),
  validateListTasksQuery: buildValidator(listTasksQuerySchema, 'query'),
  validateGenerateTransaction: buildValidator(generateTransactionSchema, 'body'),
  validateCreateItem: buildValidator(createItemSchema, 'body'),
  validateUpdateItem: buildValidator(updateItemSchema, 'body'),
  validateReorderItems: buildValidator(reorderItemsSchema, 'body')
};
