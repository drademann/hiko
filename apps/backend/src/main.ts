import express from 'express';
import { createLogger, loggingMiddleware } from '@hiko/backend-middleware';
import { wallboxRoutes } from '@hiko/backend-feature-wallbox';
import { forecastRoutes } from '@hiko/backend-feature-forecast';

const host = process.env.BACKEND_HOST ?? '0.0.0.0';
const port = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3000;

const app = express();
app.use(express.json());
app.use(loggingMiddleware);
const log = createLogger();

app.use('/api/wallbox', wallboxRoutes);
app.use('/api/forecast', forecastRoutes);

app.listen(port, host, () => {
  log.info('server started successfully', { host, port });
});
