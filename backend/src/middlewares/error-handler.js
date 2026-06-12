const { Prisma } = require('@prisma/client');
const env = require('../config/env');

function notFoundHandler(_request, response) {
  return response.status(404).json({
    statusCode: 404,
    message: 'Rota nao encontrada'
  });
}

function buildDevError(error) {
  return {
    statusCode: error.statusCode || 500,
    message: error.message || 'Erro interno do servidor',
    stack: error.stack ? error.stack.split('\n') : undefined
  };
}

function buildProdError(error) {
  return {
    statusCode: error.statusCode || 500,
    message: error.statusCode && error.statusCode < 500
      ? error.message
      : 'Erro interno do servidor'
  };
}

function mapPrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return { statusCode: 409, message: 'Registro duplicado. Este valor ja existe.' };
    }
    if (error.code === 'P2025') {
      return { statusCode: 404, message: 'Registro nao encontrado.' };
    }
    if (error.code === 'P2003') {
      return { statusCode: 400, message: 'Referencia invalida. O registro relacionado nao existe.' };
    }
    return { statusCode: 400, message: 'Erro de banco de dados.' };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, message: 'Dados invalidos enviados ao banco.' };
  }

  return null;
}

function errorHandler(error, request, _response, next) {
  if (!error) {
    return next();
  }

  const consoleError = env.nodeEnv !== 'test'
    ? console.error
    : () => {};

  consoleError(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl} - ${error.name}: ${error.message}`);
  if (env.nodeEnv === 'development' && error.stack) {
    consoleError(error.stack);
  }

  const prismaError = mapPrismaError(error);
  if (prismaError) {
    error.statusCode = prismaError.statusCode;
    error.message = prismaError.message;
  }

  if (error.name === 'ZodError' && error.issues) {
    error.statusCode = 400;
    error.message = error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    error.statusCode = error.statusCode || 401;
  }

  const statusCode = error.statusCode || 500;
  const body = env.nodeEnv === 'production'
    ? buildProdError(error)
    : buildDevError(error);

  body.statusCode = statusCode;

  if (error.code) {
    body.code = error.code;
  }

  return _response.status(statusCode).json(body);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
