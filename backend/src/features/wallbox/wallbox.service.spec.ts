import { WallboxService } from './wallbox.api';
import { WallboxRepository } from './wallbox.repository';
import { WallboxServiceImpl } from './wallbox.service';
import { ConnectionState } from './wallbox.model';

describe('WallboxService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should map response map to a WallboxState', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('conn_state: no_vehicle_connected'));

    const repository = new WallboxRepository();
    const service: WallboxService = new WallboxServiceImpl(repository);

    const state = await service.currentState();

    expect(state.connectionState).toBe(ConnectionState.NoVehicleConnected);
  });
});
