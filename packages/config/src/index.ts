import { z } from 'zod';

// ===== App Config =====

const appConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  ML_SERVICE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
});

// ===== Database Config =====

const dbConfigSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

// ===== Redis Config =====

const redisConfigSchema = z.object({
  REDIS_URL: z.string().min(1),
});

// ===== Auth Config =====

const authConfigSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
});

// ===== SMTP / Email Config =====

const smtpConfigSchema = z.object({
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM: z.string(),
});

// ===== Storage / S3 Config =====

const storageConfigSchema = z.object({
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string().default('us-east-1'),
});

// ===== ML Config =====

const mlConfigSchema = z.object({
  ML_MODEL_PATH: z.string().default('/app/ml/model.joblib'),
  ML_SERVICE_URL: z.string().url(),
});

// ===== Rate Limiting Config =====

const rateLimitConfigSchema = z.object({
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

// ===== CORS Config =====

const corsConfigSchema = z.object({
  CORS_ORIGIN: z.string().url(),
});

// ===== Combined Config =====

export const configSchema = z.object({
  app: appConfigSchema,
  db: dbConfigSchema,
  redis: redisConfigSchema,
  auth: authConfigSchema,
  smtp: smtpConfigSchema,
  storage: storageConfigSchema,
  ml: mlConfigSchema,
  rateLimit: rateLimitConfigSchema,
  cors: corsConfigSchema,
});

export type Config = z.infer<typeof configSchema>;

export function validateConfig(env: Record<string, string | undefined>): Config {
  return configSchema.parse({
    app: {
      NODE_ENV: env.NODE_ENV,
      APP_URL: env.APP_URL,
      API_URL: env.API_URL,
      ML_SERVICE_URL: env.ML_SERVICE_URL,
      FRONTEND_URL: env.FRONTEND_URL || env.APP_URL,
    },
    db: {
      DATABASE_URL: env.DATABASE_URL,
    },
    redis: {
      REDIS_URL: env.REDIS_URL,
    },
    auth: {
      JWT_SECRET: env.JWT_SECRET,
      JWT_ACCESS_TOKEN_EXPIRY: env.JWT_ACCESS_TOKEN_EXPIRY,
      JWT_REFRESH_TOKEN_EXPIRY: env.JWT_REFRESH_TOKEN_EXPIRY,
      REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET,
    },
    smtp: {
      SMTP_HOST: env.SMTP_HOST,
      SMTP_PORT: env.SMTP_PORT,
      SMTP_USER: env.SMTP_USER,
      SMTP_PASSWORD: env.SMTP_PASSWORD,
      SMTP_FROM: env.SMTP_FROM,
    },
    storage: {
      S3_ENDPOINT: env.S3_ENDPOINT,
      S3_ACCESS_KEY: env.S3_ACCESS_KEY,
      S3_SECRET_KEY: env.S3_SECRET_KEY,
      S3_BUCKET: env.S3_BUCKET,
      S3_REGION: env.S3_REGION,
    },
    ml: {
      ML_MODEL_PATH: env.ML_MODEL_PATH,
      ML_SERVICE_URL: env.ML_SERVICE_URL,
    },
    rateLimit: {
      RATE_LIMIT_WINDOW: env.RATE_LIMIT_WINDOW,
      RATE_LIMIT_MAX: env.RATE_LIMIT_MAX,
    },
    cors: {
      CORS_ORIGIN: env.CORS_ORIGIN,
    },
  });
}