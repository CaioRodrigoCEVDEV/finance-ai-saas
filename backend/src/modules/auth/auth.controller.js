const env = require('../../config/env');
const { buildAuthCookieOptions } = require('../../utils/cookie-options');
const authService = require('./auth.service');

async function register(request, response, next) {
  try {
    const { name, email, password, workspaceName } = request.body;
    const session = await authService.register({ name, email, password, workspaceName });

    response.cookie(env.cookieName, session.token, buildAuthCookieOptions());

    return response.status(201).json({
      user: session.user,
      tenant: session.tenant
    });
  } catch (error) {
    return next(error);
  }
}

async function login(request, response, next) {
  try {
    const { email, password } = request.body;
    const session = await authService.login(email, password);

    response.cookie(env.cookieName, session.token, buildAuthCookieOptions());

    return response.json({
      user: session.user,
      tenant: session.tenant
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(request, response, next) {
  try {
    return response.json({
      user: request.user,
      tenant: request.tenant
    });
  } catch (error) {
    return next(error);
  }
}

function logout(_request, response) {
  response.clearCookie(env.cookieName, buildAuthCookieOptions());

  return response.json({
    message: 'Logout realizado com sucesso'
  });
}

module.exports = {
  getMe,
  login,
  logout,
  register
};
