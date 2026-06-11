const { z } = require('zod');

const AppError = require('../../utils/app-error');

const RECURRENCE_TYPES = ['INCOME', 'EXPENSE'];
const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'YEARLY'];
const RECURRENCE_STATUSES = ['ACTIVE', 'PAUSED', 'FINISHED'];

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = String(value).trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
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

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  return String(value).trim();
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

function normalizeOptionalDate(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date('invalid');
  }

  return parsedDate;
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

const recurrenceBodyFields = {
  description: z.string().trim().min(2, 'Descricao deve ter no minimo 2 caracteres'),
  amount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor deve ser positivo')),
  type: z.enum(RECURRENCE_TYPES, { message: 'Tipo deve ser RECEITA ou DESPESA' }),
  frequency: z.enum(RECURRENCE_FREQUENCIES, { message: 'Frequencia invalida' }),
  startDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data inicial invalida' })),
  nextRunDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data da proxima geracao invalida' })),
  endDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data final invalida' }).nullable().optional()),
  accountId: z.preprocess(normalizeNullableUuid, z.string().uuid('Conta invalida').nullable().optional()),
  creditCardId: z.preprocess(normalizeNullableUuid, z.string().uuid('Cartao invalido').nullable().optional()),
  categoryId: z.preprocess(normalizeNullableUuid, z.string().uuid('Categoria invalida').nullable().optional()),
  paymentMethod: z.preprocess(normalizeNullableText, z.string().max(50).nullable().optional()),
  notes: z.preprocess(normalizeNullableText, z.string().max(1000, 'Observacoes devem ter no maximo 1000 caracteres').nullable().optional()),
  autoGenerate: z.preprocess(normalizeOptionalBoolean, z.boolean().default(false)),
  generateAsPaid: z.preprocess(normalizeOptionalBoolean, z.boolean().default(false))
};

const createRecurrenceSchema = z.object(recurrenceBodyFields).superRefine((data, context) => {
  if (data.endDate && data.endDate < data.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Data final deve ser maior ou igual a data inicial'
    });
  }

  if (data.accountId && data.creditCardId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['accountId'],
      message: 'Informe apenas uma conta ou um cartao de credito, nao ambos'
    });
  }
});

const updateRecurrenceSchema = z.object(recurrenceBodyFields).partial().refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
).superRefine((data, context) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Data final deve ser maior ou igual a data inicial'
    });
  }

  if (data.accountId && data.creditCardId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['accountId'],
      message: 'Informe apenas uma conta ou um cartao de credito, nao ambos'
    });
  }
});

const updateStatusSchema = z.object({
  status: z.enum(RECURRENCE_STATUSES, { message: 'Status invalido' })
});

const listRecurrencesQuerySchema = z.object({
  status: z.enum(RECURRENCE_STATUSES).optional(),
  type: z.enum(RECURRENCE_TYPES).optional(),
  frequency: z.enum(RECURRENCE_FREQUENCIES).optional(),
  search: z.preprocess(normalizeOptionalText, z.string().min(1).optional()),
  from: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data inicial invalida' }).optional()),
  to: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data final invalida' }).optional())
});

const recurrenceParamsSchema = z.object({
  id: z.string().min(1, 'Identificador de recorrencia invalido')
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
  createRecurrenceSchema,
  updateRecurrenceSchema,
  updateStatusSchema,
  listRecurrencesQuerySchema,
  validateCreateRecurrence: buildValidator(createRecurrenceSchema, 'body'),
  validateUpdateRecurrence: buildValidator(updateRecurrenceSchema, 'body'),
  validateUpdateStatus: buildValidator(updateStatusSchema, 'body'),
  validateRecurrenceParams: buildValidator(recurrenceParamsSchema, 'params'),
  validateListRecurrencesQuery: buildValidator(listRecurrencesQuerySchema, 'query')
};
