import { Router } from 'express';
import { Container } from 'typedi';
import { Logger, LoggerToken } from '../../core/logger.service';
import { WallboxService, WallboxServiceToken } from './wallbox.service';
import { ConnectionState, WallboxState } from './wallbox.model';
import { Unit, WallboxStateDTO } from '@hiko/api';

const router = Router();

router.get('/state', async (_, res) => {
  const logger = Container.get<Logger>(LoggerToken).child({ route: '/api/wallbox/state' });

  try {
    logger.debug('fetching wallbox state');
    const service = Container.get<WallboxService>(WallboxServiceToken);
    const state = await service.currentState();
    res.json(from(state));
  } catch (error) {
    logger.error('failed to fetch wallbox state', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).send({ error: 'failed to fetch wallbox state' });
  }
});

//region mappings
function from(state: WallboxState): WallboxStateDTO {
  return {
    connectionState: map(state.connectionState),
    charged: { value: state.charged, unit: Unit.kWh },
    duration: { value: state.duration.asSeconds(), unit: Unit.Seconds },
    power: { value: state.power, unit: Unit.kW },
  };
}

function map(connectionState: ConnectionState): string {
  switch (connectionState) {
    case ConnectionState.NoVehicleConnected:
      return 'NoVehicleConnected';
    case ConnectionState.ConnectedNotCharging:
      return 'ConnectedNotCharging';
    case ConnectionState.ConnectedCharging:
      return 'ConnectedCharging';
  }
}
//endregion

export { router as wallboxRoutes };
