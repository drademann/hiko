import 'reflect-metadata';
import 'dotenv/config';

import express from 'express';
import { Container } from 'typedi';
import { Logger, LoggerToken } from './core/logger.service';
import { loggingMiddleware } from './core/logging.middleware';
import { wallboxRoutes } from './features/wallbox/wallbox.routes';

const host = process.env.BACKEND_HOST ?? 'localhost';
const port = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3000;
const log = Container.get<Logger>(LoggerToken);

const app = express();
app.use(express.json());
app.use(loggingMiddleware);

app.use('/api/wallbox', wallboxRoutes);

app.listen(port, host, () => {
  log.info('server started successfully', { host, port });
});
