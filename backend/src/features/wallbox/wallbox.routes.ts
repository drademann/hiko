import { Router } from 'express';
import { Container } from 'typedi';
import { WallboxService, WallboxServiceToken } from './wallbox.service';

const router = Router();

router.get('/state', async (req, res) => {
  try {
    const service = Container.get<WallboxService>(WallboxServiceToken);
    const state = await service.currentState();
    res.json(state);
  } catch (error) {
    console.error('error fetching wallbox state', error);
    res.status(500).send({ error: 'failed to fetch wallbox state' });
  }
});

export { router as wallboxRoutes };
