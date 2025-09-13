import { Router } from 'express';
import { createLogger } from '@hiko/backend-middleware';
import { currentWallboxState } from './wallbox.service';
import { ConnectionState, WallboxState } from './wallbox.model';
import { Unit, WallboxStateDTO } from '@hiko/api';

const router = Router();

router.get('/state', async (_, res) => {
  const log = createLogger({ route: '/api/wallbox/state' });
  try {
    res.json(from(await currentWallboxState()));
  } catch (error) {
    log.error('failed to fetch wallbox state', {
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
