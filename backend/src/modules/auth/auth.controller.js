const env = require('../../config/env');
const { buildAuthCookieOptions } = require('../../utils/cookie-options');
const authService = require('./auth.service');

async function register(request, response, next) {
  try {
    const { name, email, password, workspaceName } = request.body;
    const result = await authService.register({ name, email, password, workspaceName });

    return response.status(201).json(result);
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

async function verifyEmail(request, response, next) {
  try {
    const { token } = request.query;
    const result = await authService.verifyEmail(token);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function resendVerification(request, response, next) {
  try {
    const { email } = request.body;
    const result = await authService.resendVerification(email);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(request, response, next) {
  try {
    const { email } = request.body;
    const result = await authService.forgotPassword(email);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(request, response, next) {
  try {
    const { token, password } = request.body;
    const result = await authService.resetPassword(token, password);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  login,
  logout,
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};
