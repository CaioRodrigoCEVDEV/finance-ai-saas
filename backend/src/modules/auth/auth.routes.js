const { Router } = require('express');
const { z } = require('zod');

const AppError = require('../../utils/app-error');
const { authenticate } = require('./auth.middleware');
const { authLimiter } = require('../../middlewares/rate-limiter');
const authController = require('./auth.controller');

const authRoutes = Router();

const loginSchema = z.object({
  email: z.string().email('Email invalido').max(255),
  password: z.string().min(1, 'Senha obrigatoria').max(128)
});

const registerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio').max(255),
  email: z.string().email('Email invalido').max(255),
  password: z.string().min(6, 'A senha deve ter no minimo 6 caracteres').max(128),
  workspaceName: z.string().max(255).optional()
});

function validateLogin(request, _response, next) {
  const parsedBody = loginSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return next(new AppError(parsedBody.error.issues[0]?.message || 'Dados invalidos', 400));
  }

  request.body = parsedBody.data;
  return next();
}

function validateRegister(request, _response, next) {
  const parsedBody = registerSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return next(new AppError(parsedBody.error.issues[0]?.message || 'Dados invalidos', 400));
  }

  request.body = parsedBody.data;
  return next();
}

authRoutes.post('/auth/register', authLimiter, validateRegister, authController.register);
authRoutes.post('/auth/login', authLimiter, validateLogin, authController.login);
authRoutes.post('/auth/logout', authController.logout);
authRoutes.get('/auth/me', authenticate, authController.getMe);

module.exports = authRoutes;
