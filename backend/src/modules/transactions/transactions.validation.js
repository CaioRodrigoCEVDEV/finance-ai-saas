const { z } = require('zod');

const AppError = require('../../utils/app-error');

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT'];
const TRANSACTION_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELED'];
const PAYMENT_METHODS = ['PIX', 'DEBIT_CARD', 'CREDIT_CARD', 'CASH', 'BANK_SLIP', 'TRANSFER', 'OTHER'];
const TRANSACTION_SOURCES = ['MANUAL', 'CSV', 'OFX', 'OPEN_FINANCE', 'API'];

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

const transactionBodyFields = {
  description: z.string().trim().min(2, 'Descricao deve ter no minimo 2 caracteres'),
  amount: z.preprocess(normalizeOptionalNumber, z.number().positive('Valor deve ser positivo')),
  type: z.enum(TRANSACTION_TYPES),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  transactionDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data da transacao invalida' })),
  paymentMethod: z.enum(PAYMENT_METHODS),
  accountId: z.preprocess(normalizeNullableUuid, z.string().uuid('Conta invalida').nullable().optional()),
  creditCardId: z.preprocess(normalizeNullableUuid, z.string().uuid('Cartao invalido').nullable().optional()),
  categoryId: z.preprocess(normalizeNullableUuid, z.string().uuid('Categoria invalida').nullable().optional()),
  notes: z.preprocess(normalizeNullableText, z.string().max(1000, 'Observacoes devem ter no maximo 1000 caracteres').nullable().optional()),
  isInstallment: z.boolean().optional(),
  installmentNumber: z.preprocess(normalizeOptionalInteger, z.number().int('Numero da parcela invalido').nullable().optional()),
  installmentTotal: z.preprocess(normalizeOptionalInteger, z.number().int('Total de parcelas invalido').nullable().optional())
};

function withInstallmentValidation(schema) {
  return schema.superRefine((data, context) => {
  const isInstallment = data.isInstallment ?? false;

  if (!isInstallment && (data.installmentNumber !== undefined || data.installmentTotal !== undefined)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['installmentNumber'],
      message: 'Parcelas so podem ser informadas quando a transacao estiver marcada como parcelada'
    });
  }

  if (isInstallment) {
    if (!data.installmentTotal || data.installmentTotal <= 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installmentTotal'],
        message: 'Total de parcelas deve ser maior que 1'
      });
    }

    if (!data.installmentNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installmentNumber'],
        message: 'Numero da parcela e obrigatorio para transacoes parceladas'
      });
    }

    if (data.installmentNumber && data.installmentTotal) {
      if (data.installmentNumber < 1 || data.installmentNumber > data.installmentTotal) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['installmentNumber'],
          message: 'Numero da parcela deve estar entre 1 e o total de parcelas'
        });
      }
    }
  }
  });
}

const createTransactionSchema = withInstallmentValidation(z.object({
  ...transactionBodyFields,
  status: z.enum(TRANSACTION_STATUSES).default('CONFIRMED'),
  isInstallment: z.boolean().default(false)
}));

const updateTransactionSchema = withInstallmentValidation(z.object(transactionBodyFields).partial()).refine(
  (data) => Object.keys(data).length > 0,
  'Informe ao menos um campo para atualizacao'
);

const listTransactionsQuerySchema = z.object({
  page: z.preprocess(normalizeOptionalInteger, z.number().int().min(1, 'Pagina invalida').default(1)),
  limit: z.preprocess(normalizeOptionalInteger, z.number().int().min(1, 'Limite invalido').max(100, 'Limite maximo de 100 registros').default(20)),
  type: z.enum(TRANSACTION_TYPES).optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  accountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta invalida').optional()),
  creditCardId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Cartao invalido').optional()),
  categoryId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Categoria invalida').optional()),
  startDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data inicial invalida' }).optional()),
  endDate: z.preprocess(normalizeOptionalDate, z.date({ message: 'Data final invalida' }).optional()),
  search: z.preprocess(normalizeOptionalText, z.string().min(1).optional()),
  source: z.enum(TRANSACTION_SOURCES).optional()
}).superRefine((data, context) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Data final deve ser maior ou igual a data inicial'
    });
  }
});

const transactionParamsSchema = z.object({
  id: z.string().uuid('Identificador de transacao invalido')
});

const monthSummaryQuerySchema = z.object({
  month: z.preprocess(normalizeOptionalInteger, z.number().int().min(1, 'Mes invalido').max(12, 'Mes invalido').optional()),
  year: z.preprocess(normalizeOptionalInteger, z.number().int().min(2000, 'Ano invalido').max(3000, 'Ano invalido').optional())
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
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
  validateCreateTransaction: buildValidator(createTransactionSchema, 'body'),
  validateUpdateTransaction: buildValidator(updateTransactionSchema, 'body'),
  validateTransactionParams: buildValidator(transactionParamsSchema, 'params'),
  validateListTransactionsQuery: buildValidator(listTransactionsQuerySchema, 'query'),
  validateMonthSummaryQuery: buildValidator(monthSummaryQuerySchema, 'query')
};
