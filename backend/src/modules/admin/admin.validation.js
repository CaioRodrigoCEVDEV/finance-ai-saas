const { z } = require('zod');
const AppError = require('../../utils/app-error');

const tenantPlanEnum = z.enum(['FREE', 'PRO', 'PREMIUM', 'FAMILY']);
const tenantStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);
const userStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);
const globalRoleEnum = z.enum(['USER', 'SUPER_ADMIN']);
const feedbackStatusEnum = z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  plan: tenantPlanEnum.optional(),
  globalRole: globalRoleEnum.optional(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  plan: tenantPlanEnum.optional(),
  status: tenantStatusEnum.optional()
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  status: userStatusEnum.optional(),
  globalRole: globalRoleEnum.optional()
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no minimo 6 caracteres').max(128)
});

const updatePlanLimitSchema = z.object({
  maxAccounts: z.coerce.number().int().min(0).optional(),
  maxCreditCards: z.coerce.number().int().min(0).optional(),
  maxUsers: z.coerce.number().int().min(1).optional(),
  maxTransactionsPerMonth: z.coerce.number().int().min(0).optional(),
  canImport: z.boolean().optional(),
  canExportReports: z.boolean().optional(),
  canUseAi: z.boolean().optional(),
  canUseOpenFinance: z.boolean().optional()
});

const updateFeedbackSchema = z.object({
  status: feedbackStatusEnum
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

const paramsSchema = z.object({
  id: z.string().uuid('ID invalido')
});

module.exports = {
  validateListQuery: buildValidator(listQuerySchema, 'query'),
  validateUpdateTenant: buildValidator(updateTenantSchema, 'body'),
  validateUpdateUser: buildValidator(updateUserSchema, 'body'),
  validateResetPassword: buildValidator(resetPasswordSchema, 'body'),
  validateUpdatePlanLimit: buildValidator(updatePlanLimitSchema, 'body'),
  validateUpdateFeedback: buildValidator(updateFeedbackSchema, 'body'),
  validateParams: buildValidator(paramsSchema, 'params')
};
