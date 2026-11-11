import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { categoryCreateSchema, categoryUpdateSchema } from './categories.schemas';
import * as categoriesService from './categories.service';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    return categoriesService.listCategories(request.userId!);
  });

  app.post('/', async (request, reply) => {
    const data = categoryCreateSchema.parse(request.body);
    const category = await categoriesService.createCategory(request.userId!, data);
    return reply.status(201).send(category);
  });

  app.patch('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const data = categoryUpdateSchema.parse(request.body);
    return categoriesService.updateCategory(request.userId!, id, data);
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    await categoriesService.deleteCategory(request.userId!, id);
    return reply.status(204).send();
  });
}
