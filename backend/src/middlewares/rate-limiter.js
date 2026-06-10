const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const env = require('../config/env');

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitAuthMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  handler: (_request, response) => {
    return response.status(429).json({
      message: 'Muitas tentativas. Aguarde e tente novamente.'
    });
  },
  skip: () => env.nodeEnv === 'test'
});

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitApiMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (request, response) => {
    const tenantId = request.tenant?.id;
    const userId = request.user?.id;
    const ip = ipKeyGenerator(request, response);
    if (tenantId && userId) {
      return `${ip}-${tenantId}-${userId}`;
    }
    return ip;
  },
  handler: (_request, response) => {
    return response.status(429).json({
      message: 'Limite de requisicoes atingido. Aguarde e tente novamente.'
    });
  },
  skip: () => env.nodeEnv === 'test'
});

const strictLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (request, response) => {
    const tenantId = request.tenant?.id;
    const userId = request.user?.id;
    const ip = ipKeyGenerator(request, response);
    if (tenantId && userId) {
      return `${ip}-${tenantId}-${userId}`;
    }
    return ip;
  },
  handler: (_request, response) => {
    return response.status(429).json({
      message: 'Limite de requisicoes atingido para esta operacao.'
    });
  },
  skip: () => env.nodeEnv === 'test'
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter
};
