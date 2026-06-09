const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.string().default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1).default('change-me'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
  JWT_COOKIE_NAME: z.string().min(1).default('financeai_token')
});

const parsedEnv = envSchema.parse(process.env);

module.exports = {
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  frontendUrl: parsedEnv.FRONTEND_URL,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  jwtCookieName: parsedEnv.JWT_COOKIE_NAME
};
