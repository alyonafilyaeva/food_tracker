import type { FastifyInstance } from 'fastify';
import { credentialsSchema } from './auth.schemas';
import * as authService from './auth.service';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { requireAuth } from '../../middleware/auth';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    if (!env.ALLOW_REGISTRATION) {
      throw new AppError(403, 'Регистрация новых пользователей отключена');
    }
    const { email, password } = credentialsSchema.parse(request.body);
    const result = await authService.register(email, password);
    return reply.status(201).send(result);
  });

  app.post('/login', async (request, reply) => {
    const { email, password } = credentialsSchema.parse(request.body);
    const result = await authService.login(email, password);
    return reply.send(result);
  });

  app.get('/me', { preHandler: requireAuth }, async (request) => {
    return authService.getUser(request.userId!);
  });
}
