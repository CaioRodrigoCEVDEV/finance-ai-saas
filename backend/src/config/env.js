const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional().default(''),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1).default('change-me'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  COOKIE_NAME: z.string().min(1).optional(),
  JWT_COOKIE_NAME: z.string().min(1).optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),
  RATE_LIMIT_API_MAX: z.coerce.number().default(200),
  PAYMENT_SECRET_ENCRYPTION_KEY: z.string().min(16, 'PAYMENT_SECRET_ENCRYPTION_KEY deve ter no minimo 16 caracteres').default('change-payment-secret-key')
});

const parsedEnv = envSchema.parse(process.env);

module.exports = {
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  frontendUrl: parsedEnv.FRONTEND_URL,
  allowedOrigins: parsedEnv.ALLOWED_ORIGINS,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  cookieName: parsedEnv.COOKIE_NAME || parsedEnv.JWT_COOKIE_NAME || 'finance_ai_token',
  rateLimitWindowMs: parsedEnv.RATE_LIMIT_WINDOW_MS,
  rateLimitAuthMax: parsedEnv.RATE_LIMIT_AUTH_MAX,
  rateLimitApiMax: parsedEnv.RATE_LIMIT_API_MAX,
  paymentSecretEncryptionKey: parsedEnv.PAYMENT_SECRET_ENCRYPTION_KEY
};
