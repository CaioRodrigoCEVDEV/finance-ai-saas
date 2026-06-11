const { z } = require('zod');

const AppError = require('../../utils/app-error');

const CURRENCIES = ['BRL', 'USD', 'EUR'];
const THEMES = ['system', 'light', 'dark'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }
  return String(value).trim();
}

function normalizeBoolean(value) {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

const notificationsSchema = z.object({
  budgetWarning: z.boolean({ message: 'notifications.budgetWarning deve ser true ou false' }),
  budgetExceeded: z.boolean({ message: 'notifications.budgetExceeded deve ser true ou false' }),
  invoiceDue: z.boolean({ message: 'notifications.invoiceDue deve ser true ou false' }),
  goalBehind: z.boolean({ message: 'notifications.goalBehind deve ser true ou false' })
});

const updateSettingsSchema = z.object({
  currency: z.enum(CURRENCIES).optional(),
  financialMonthStartDay: z.number().int().min(1).max(28).optional(),
  defaultAccountId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Conta padrao invalida').nullable().optional()),
  defaultExpenseCategoryId: z.preprocess(normalizeOptionalUuid, z.string().uuid('Categoria padrao invalida').nullable().optional()),
  theme: z.enum(THEMES).optional(),
  dateFormat: z.enum(DATE_FORMATS).optional(),
  notifications: notificationsSchema.optional()
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
  validateUpdateSettings: buildValidator(updateSettingsSchema, 'body')
};
