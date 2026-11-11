import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { registerErrorHandler } from './lib/errors';
import { requireAuth } from './middleware/auth';
import { authRoutes } from './modules/auth/auth.routes';
import { storeRoutes } from './modules/stores/stores.routes';
import { categoryRoutes } from './modules/categories/categories.routes';
import { productRoutes } from './modules/products/products.routes';
import { purchaseRoutes } from './modules/purchases/purchases.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

export function buildApp() {
  const app = Fastify({ logger: true });

  // В проде CORS сужен до домена фронтенда (FRONTEND_URL); локально, когда он не задан, разрешён любой origin
  app.register(cors, { origin: env.FRONTEND_URL ?? true });

  registerErrorHandler(app);

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(
    async (api) => {
      api.register(authRoutes, { prefix: '/auth' });

      api.register(async (protectedApi) => {
        protectedApi.addHook('preHandler', requireAuth);
        protectedApi.register(storeRoutes, { prefix: '/stores' });
        protectedApi.register(categoryRoutes, { prefix: '/categories' });
        protectedApi.register(productRoutes, { prefix: '/products' });
        protectedApi.register(purchaseRoutes, { prefix: '/purchases' });
        protectedApi.register(analyticsRoutes, { prefix: '/analytics' });
      });
    },
    { prefix: '/api' },
  );

  return app;
}
