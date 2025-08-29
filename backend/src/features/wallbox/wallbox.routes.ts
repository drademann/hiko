import { Router } from 'express';
import { Container } from 'typedi';
import { Logger, LoggerToken } from '../../core/logger.service';
import { WallboxService, WallboxServiceToken } from './wallbox.service';

const router = Router();

router.get('/state', async (req, res) => {
  const logger = Container.get<Logger>(LoggerToken).child({ route: '/api/wallbox/state' });

  try {
    logger.debug('fetching wallbox state');
    const service = Container.get<WallboxService>(WallboxServiceToken);
    const state = await service.currentState();
    res.json(state);
  } catch (error) {
    logger.error('failed to fetch wallbox state', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).send({ error: 'failed to fetch wallbox state' });
  }
});

export { router as wallboxRoutes };
