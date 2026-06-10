const { Router } = require('express');
const { z } = require('zod');

const AppError = require('../../utils/app-error');
const { authenticate } = require('./auth.middleware');
const authController = require('./auth.controller');

const authRoutes = Router();

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha obrigatoria')
});

function validateLogin(request, _response, next) {
  const parsedBody = loginSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return next(new AppError(parsedBody.error.issues[0]?.message || 'Dados invalidos', 400));
  }

  request.body = parsedBody.data;
  return next();
}

authRoutes.post('/auth/login', validateLogin, authController.login);
authRoutes.post('/auth/logout', authController.logout);
authRoutes.get('/auth/me', authenticate, authController.getMe);

module.exports = authRoutes;
