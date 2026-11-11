import { buildApp } from './app';
import { env } from './config/env';

const app = buildApp();

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`Сервер запущен на порту ${env.PORT}`))
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
