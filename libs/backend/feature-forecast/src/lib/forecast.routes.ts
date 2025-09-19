import { Router } from 'express';
import { createLogger } from '@hiko/backend-middleware';
import { currentForecast } from './forecast.service';
import { Forecast } from './forecast.model';
import { ForecastDTO, Unit } from '@hiko/api';

const router = Router();

router.get('/', async (_, res) => {
  const log = createLogger({ route: '/api/forecast' });
  try {
    res.json(from(await currentForecast()));
  } catch (error) {
    log.error('failed to fetch forecast', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).send({ error: 'failed to fetch forecast' });
  }
});

//region mappings
function from(forecast: Forecast): ForecastDTO {
  return {
    powerValues: forecast.powerValues.map((pv) => ({ value: pv.value, unit: Unit.kW })),
  };
}
//endregion

export { router as forecastRoutes };
