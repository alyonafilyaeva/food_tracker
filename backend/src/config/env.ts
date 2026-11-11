import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL не задан'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET должен быть не короче 16 символов'),
  PORT: z.coerce.number().int().positive().default(4000),
  ALLOW_REGISTRATION: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  // Домен фронтенда для CORS в проде. В локальной разработке не задан — разрешаем любой origin.
  FRONTEND_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
