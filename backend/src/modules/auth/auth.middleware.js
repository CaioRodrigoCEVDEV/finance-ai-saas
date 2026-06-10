const AppError = require('../../utils/app-error');
const env = require('../../config/env');
const { verifyToken } = require('../../services/token-service');
const authService = require('./auth.service');

async function authenticate(request, _response, next) {
  try {
    const token = request.cookies?.[env.cookieName];

    if (!token) {
      throw new AppError('Nao autenticado', 401);
    }

    const payload = verifyToken(token);
    const session = await authService.findAuthenticatedUser(payload.userId, payload.tenantId);

    request.user = session.user;
    request.tenant = session.tenant;

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Sessao invalida ou expirada', 401));
    }

    return next(error);
  }
}

module.exports = {
  authenticate
};
