import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { storeCreateSchema, storeUpdateSchema } from './stores.schemas';
import * as storesService from './stores.service';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function storeRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    return storesService.listStores(request.userId!);
  });

  app.post('/', async (request, reply) => {
    const data = storeCreateSchema.parse(request.body);
    const store = await storesService.createStore(request.userId!, data);
    return reply.status(201).send(store);
  });

  app.get('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    return storesService.getStore(request.userId!, id);
  });

  app.patch('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const data = storeUpdateSchema.parse(request.body);
    return storesService.updateStore(request.userId!, id, data);
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    await storesService.deleteStore(request.userId!, id);
    return reply.status(204).send();
  });
}
