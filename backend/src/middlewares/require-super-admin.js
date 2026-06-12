const AppError = require('../utils/app-error');

function requireSuperAdmin(request, _response, next) {
  if (!request.user || request.user.globalRole !== 'SUPER_ADMIN') {
    return next(new AppError('Acesso restrito ao super administrador', 403));
  }

  return next();
}

module.exports = requireSuperAdmin;
