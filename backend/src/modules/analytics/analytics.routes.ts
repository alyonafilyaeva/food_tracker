import type { FastifyInstance } from 'fastify';
import {
  topProductsQuerySchema,
  storeComparisonQuerySchema,
  spendingOverTimeQuerySchema,
  dateRangeQuerySchema,
} from './analytics.schemas';
import * as analyticsService from './analytics.service';

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/top-products', async (request) => {
    const query = topProductsQuerySchema.parse(request.query);
    return analyticsService.getTopProducts(request.userId!, query);
  });

  app.get('/store-comparison', async (request) => {
    const { productId } = storeComparisonQuerySchema.parse(request.query);
    return analyticsService.getStoreComparison(request.userId!, productId);
  });

  app.get('/spending-over-time', async (request) => {
    const query = spendingOverTimeQuerySchema.parse(request.query);
    return analyticsService.getSpendingOverTime(request.userId!, query);
  });

  app.get('/spending-breakdown', async (request) => {
    const query = dateRangeQuerySchema.parse(request.query);
    return analyticsService.getSpendingBreakdown(request.userId!, query);
  });

  app.get('/average-check', async (request) => {
    const query = dateRangeQuerySchema.parse(request.query);
    return analyticsService.getAverageCheck(request.userId!, query);
  });
}
