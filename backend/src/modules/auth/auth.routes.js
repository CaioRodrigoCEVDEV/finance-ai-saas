const { Router } = require('express');
const { z } = require('zod');

const AppError = require('../../utils/app-error');
const { authenticate } = require('./auth.middleware');
const { authLimiter, strictLimiter } = require('../../middlewares/rate-limiter');
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

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token obrigatorio')
});

const resendVerificationSchema = z.object({
  email: z.string().email('Email invalido').max(255)
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalido').max(255)
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatorio'),
  password: z.string().min(6, 'A senha deve ter no minimo 6 caracteres').max(128)
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

function validateVerifyEmail(request, _response, next) {
  const parsedQuery = verifyEmailSchema.safeParse(request.query);

  if (!parsedQuery.success) {
    return next(new AppError(parsedQuery.error.issues[0]?.message || 'Token invalido', 400));
  }

  request.query = parsedQuery.data;
  return next();
}

function validateResendVerification(request, _response, next) {
  const parsedBody = resendVerificationSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return next(new AppError(parsedBody.error.issues[0]?.message || 'Dados invalidos', 400));
  }

  request.body = parsedBody.data;
  return next();
}

function validateForgotPassword(request, _response, next) {
  const parsedBody = forgotPasswordSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return next(new AppError(parsedBody.error.issues[0]?.message || 'Dados invalidos', 400));
  }

  request.body = parsedBody.data;
  return next();
}

function validateResetPassword(request, _response, next) {
  const parsedBody = resetPasswordSchema.safeParse(request.body);

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
authRoutes.get('/auth/verify-email', strictLimiter, validateVerifyEmail, authController.verifyEmail);
authRoutes.post('/auth/resend-verification', strictLimiter, validateResendVerification, authController.resendVerification);
authRoutes.post('/auth/forgot-password', strictLimiter, validateForgotPassword, authController.forgotPassword);
authRoutes.post('/auth/reset-password', strictLimiter, validateResetPassword, authController.resetPassword);

module.exports = authRoutes;
