const AppError = require('../utils/app-error');

function authorize(...allowedRoles) {
  return function authorizationMiddleware(request, _response, next) {
    if (!request.tenant) {
      return next(new AppError('Acesso nao autorizado', 403));
    }

    if (!allowedRoles.includes(request.tenant.role)) {
      return next(new AppError('Permissao insuficiente', 403));
    }

    return next();
  };
}

const requireOwner = authorize('OWNER');
const requireOwnerOrAdmin = authorize('OWNER', 'ADMIN');
const requireWrite = authorize('OWNER', 'ADMIN', 'MEMBER');

module.exports = {
  authorize,
  requireOwner,
  requireOwnerOrAdmin,
  requireWrite
};
