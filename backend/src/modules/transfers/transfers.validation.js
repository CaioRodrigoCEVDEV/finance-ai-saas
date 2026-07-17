const { z } = require('zod');

const AppError = require('../../utils/app-error');
const { parseLocalDate } = require('../../utils/date-utils');

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

  const parsedDate = parseLocalDate(value);

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return new Date('invalid');
  }

  return parsedDate;
}

const createTransferSchema = z.object({
  description: z.string().trim().min(2, 'Descricao deve ter no minimo 2 caracteres'),
  amount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor deve ser positivo')),
  transactionDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data da transferencia invalida' })),
  fromAccountId: z.string().uuid('Conta de origem invalida'),
  toAccountId: z.string().uuid('Conta de destino invalida'),
  notes: z.preprocess(normalizeNullableText, z.string().max(1000, 'Observacoes devem ter no maximo 1000 caracteres').nullable().optional())
}).refine((data) => data.fromAccountId !== data.toAccountId, {
  message: 'Conta de origem e destino devem ser diferentes',
  path: ['toAccountId']
});

const updateTransferSchema = z.object({
  description: z.preprocess(normalizeOptionalText, z.string().trim().min(2, 'Descricao deve ter no minimo 2 caracteres').optional()),
  amount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor deve ser positivo').optional()),
  transactionDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data da transferencia invalida' }).optional()),
  fromAccountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta de origem invalida').optional()),
  toAccountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta de destino invalida').optional()),
  notes: z.preprocess(normalizeNullableText, z.string().max(1000, 'Observacoes devem ter no maximo 1000 caracteres').nullable().optional())
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Informe ao menos um campo para atualizacao'
}).refine((data) => {
  if (data.fromAccountId && data.toAccountId) {
    return data.fromAccountId !== data.toAccountId;
  }
  return true;
}, {
  message: 'Conta de origem e destino devem ser diferentes',
  path: ['toAccountId']
});

const transferParamsSchema = z.object({
  id: z.string().uuid('Identificador de transferencia invalido')
});

const listTransfersQuerySchema = z.object({
  page: z.preprocess(normalizeOptionalNumber, z.number().int().min(1, 'Pagina invalida').default(1)),
  limit: z.preprocess(normalizeOptionalNumber, z.number().int().min(1, 'Limite invalido').max(100, 'Limite maximo de 100 registros').default(20)),
  accountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta invalida').optional()),
  startDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data inicial invalida' }).optional()),
  endDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data final invalida' }).optional()),
  search: z.preprocess(normalizeOptionalText, z.string().min(1).optional())
}).superRefine((data, context) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Data final deve ser maior ou igual a data inicial'
    });
  }
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
  createTransferSchema,
  updateTransferSchema,
  validateCreateTransfer: buildValidator(createTransferSchema, 'body'),
  validateUpdateTransfer: buildValidator(updateTransferSchema, 'body'),
  validateTransferParams: buildValidator(transferParamsSchema, 'params'),
  validateListTransfersQuery: buildValidator(listTransfersQuerySchema, 'query')
};
