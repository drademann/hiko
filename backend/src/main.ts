import 'reflect-metadata';
import 'dotenv/config';

import express from 'express';
import { wallboxRoutes } from './features/wallbox/wallbox.routes';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());

app.use('/api/wallbox', wallboxRoutes);

app.listen(port, host, () => {
  console.log(`[ ready ] ${host}:${port}`);
});
