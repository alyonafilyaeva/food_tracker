import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'ValidationError', details: error.issues });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Запись с такими данными уже существует' });
      }
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Запись не найдена' });
      }
      if (error.code === 'P2003') {
        return reply
          .status(409)
          .send({ error: 'Невозможно удалить: запись используется в других данных' });
      }
    }

    request.log.error(error);
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
  });
}
