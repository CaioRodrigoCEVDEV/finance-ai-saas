const { z } = require('zod');

const AppError = require('../../utils/app-error');

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().trim().email('Email inválido').max(255)
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha deve ter no mínimo 6 caracteres')
});

function buildValidator(schema, target) {
  return function validate(request, _response, next) {
    const parsedData = schema.safeParse(request[target]);

    if (!parsedData.success) {
      return next(new AppError(parsedData.error.issues[0]?.message || 'Dados inválidos', 400));
    }

    request[target] = parsedData.data;
    return next();
  };
}

module.exports = {
  validateUpdateProfile: buildValidator(updateProfileSchema, 'body'),
  validateUpdatePassword: buildValidator(updatePasswordSchema, 'body'),
  validateAvatarUpload
};

function validateAvatarUpload(request, response, next) {
  if (!request.file) {
    return next(new AppError('Nenhuma imagem enviada', 400));
  }
  return next();
}
