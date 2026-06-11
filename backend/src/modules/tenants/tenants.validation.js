const { z } = require('zod');

const AppError = require('../../utils/app-error');

const updateCurrentTenantSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no minimo 2 caracteres').max(80, 'Nome deve ter no maximo 80 caracteres')
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
  validateUpdateCurrentTenant: buildValidator(updateCurrentTenantSchema, 'body')
};
