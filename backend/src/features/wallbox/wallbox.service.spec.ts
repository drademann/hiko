import { WallboxRepository, WallboxRepositoryToken } from './wallbox.repository';
import { WallboxService, WallboxServiceImpl } from './wallbox.service';
import { ConnectionState } from './wallbox.model';
import { Container } from 'typedi';

describe('WallboxService', () => {
  let service: WallboxService;

  beforeEach(() => {
    Container.set(WallboxRepositoryToken, new WallboxRepository());
    service = new WallboxServiceImpl();
  });

  it('should map response map to a WallboxState', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('conn_state: no_vehicle_connected'));

    const state = await service.currentState();

    expect(state.connectionState).toBe(ConnectionState.NoVehicleConnected);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
});
