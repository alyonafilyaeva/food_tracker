import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  productCreateSchema,
  productUpdateSchema,
  productListQuerySchema,
  mergeProductsSchema,
} from './products.schemas';
import * as productsService from './products.service';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function productRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const query = productListQuerySchema.parse(request.query);
    return productsService.listProducts(request.userId!, query);
  });

  app.post('/', async (request, reply) => {
    const data = productCreateSchema.parse(request.body);
    const product = await productsService.createProduct(request.userId!, data);
    return reply.status(201).send(product);
  });

  app.get('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    return productsService.getProduct(request.userId!, id);
  });

  app.get('/:id/last-purchase', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    return productsService.getLastPurchaseInfo(request.userId!, id);
  });

  app.patch('/:id', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const data = productUpdateSchema.parse(request.body);
    return productsService.updateProduct(request.userId!, id, data);
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    await productsService.deleteProduct(request.userId!, id);
    return reply.status(204).send();
  });

  app.post('/:id/merge', async (request) => {
    const { id } = paramsSchema.parse(request.params);
    const { targetProductId } = mergeProductsSchema.parse(request.body);
    return productsService.mergeProducts(request.userId!, id, targetProductId);
  });
}
