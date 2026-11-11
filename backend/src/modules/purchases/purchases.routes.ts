import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  purchaseCreateSchema,
  purchaseUpdateSchema,
  purchaseListQuerySchema,
} from './purchases.schemas';
import * as purchasesService from './purchases.service';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function purchaseRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const query = purchaseListQuerySchema.parse(request.query);
    return purchasesService.listPurchases(request.userId!, query);
  });

  app.post('/', async (request, reply) => {
    const data = purchaseCreateSchema.parse(request.body);
    const purchase = await purchasesService.createPurchase(request.userId!, data);
    return reply.status(201).send(purchase);
  });

  app.get('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    return purchasesService.getPurchase(request.userId!, id);
  });

  app.patch('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const data = purchaseUpdateSchema.parse(request.body);
    return purchasesService.updatePurchase(request.userId!, id, data);
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    await purchasesService.deletePurchase(request.userId!, id);
    return reply.status(204).send();
  });
}
