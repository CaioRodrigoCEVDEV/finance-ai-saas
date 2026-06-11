const { z } = require('zod');
const AppError = require('../../utils/app-error');

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmedValue = String(value).trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
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

const ALLOWED_TARGET_PATHS = ['/', '/plans', '/checkout'];

const createInviteSchema = z.object({
  title: z.preprocess(normalizeOptionalText, z.string().trim().optional()),
  targetPath: z.preprocess(normalizeOptionalText, z.string().trim().refine(
    (val) => ALLOWED_TARGET_PATHS.includes(val),
    { message: `Destino deve ser um dos seguintes: ${ALLOWED_TARGET_PATHS.join(', ')}` }
  ).optional()),
  expiresAt: z.preprocess(normalizeOptionalDate, z.date().optional())
});

const updateInviteStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DISABLED'], {
    message: 'Status deve ser ACTIVE ou DISABLED'
  })
});

const inviteParamsSchema = z.object({
  id: z.string().min(1, 'Identificador de convite invalido')
});

const inviteCodeParamsSchema = z.object({
  code: z.string().min(1, 'Codigo de convite invalido')
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
  ALLOWED_TARGET_PATHS,
  validateCreateInvite: buildValidator(createInviteSchema, 'body'),
  validateUpdateInviteStatus: buildValidator(updateInviteStatusSchema, 'body'),
  validateInviteParams: buildValidator(inviteParamsSchema, 'params'),
  validateInviteCodeParams: buildValidator(inviteCodeParamsSchema, 'params')
};
