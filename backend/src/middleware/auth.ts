import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Требуется авторизация');
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    request.userId = payload.sub;
  } catch {
    throw new AppError(401, 'Неверный или просроченный токен');
  }
}
