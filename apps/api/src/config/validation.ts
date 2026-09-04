import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ── App ──────────────────────────────────────────────────────────
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT:     Joi.number().default(3001),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // ── Database (Supabase Postgres) ──────────────────────────────────
  DATABASE_URL: Joi.string().default('file:./dev.db'),

  // ── Admin JWT ─────────────────────────────────────────────────────
  ADMIN_JWT_SECRET:     Joi.string().min(16).default('a7e4a9dd61c88412ae268f0e8005393d69a1ef10e4ed189c71a1d4195f11e86b5c6fd8efe9cc4f74392263e45e0c9ce2'),
  ADMIN_JWT_EXPIRES_IN: Joi.string().default('8h'),

  // ── SMTP (Nodemailer / Gmail) ─────────────────────────────────────
  SMTP_HOST: Joi.string().allow('').default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  SMTP_FROM: Joi.string().allow('').optional(),

  // ── Storage (optional for local dev) ─────────────────────────────
  STORAGE_PROVIDER:    Joi.string().valid('s3', 'b2', 'local').default('local'),
  AWS_ACCESS_KEY_ID:   Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_REGION:          Joi.string().allow('').default('ap-southeast-1'),
  AWS_S3_BUCKET:       Joi.string().allow('').optional(),
  AWS_S3_PUBLIC_BUCKET: Joi.string().allow('').optional(),

  // ── Bunny.net (optional) ──────────────────────────────────────────
  BUNNY_STREAM_API_KEY:    Joi.string().allow('').optional(),
  BUNNY_STREAM_LIBRARY_ID: Joi.string().allow('').optional(),
  BUNNY_CDN_HOSTNAME:      Joi.string().allow('').optional(),

  // ── Frontend ──────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: Joi.string().allow('').default('http://localhost:3000'),

}).options({ allowUnknown: true });
