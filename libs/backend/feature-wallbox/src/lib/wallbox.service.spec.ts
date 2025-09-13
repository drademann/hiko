import { WallboxRepository, WallboxRepositoryToken } from './wallbox.repository';
import { WallboxService, WallboxServiceImpl } from './wallbox.service';
import { ConnectionState, kW, kWh } from './wallbox.model';
import { Container } from 'typedi';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { LoggerToken } from '@hiko/backend-middleware';
import { testWallboxResponseBody } from './wallbox.repository.spec';

describe('WallboxService', () => {
  let service: WallboxService;

  beforeEach(() => {
    const mockedLogger = {
      child: jest.fn().mockReturnThis(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    Container.set(LoggerToken, mockedLogger);
    Container.set(WallboxRepositoryToken, new WallboxRepository());
    service = new WallboxServiceImpl();
  });

  test.each([
    ['no_vehicle_connected', ConnectionState.NoVehicleConnected],
    ['vehicle_connected_type2', ConnectionState.ConnectedNotCharging],
    ['vehicle_charging_type2', ConnectionState.ConnectedCharging],
  ])('should map "%s" to %s', async (connStateResponse, expectedState) => {
    const body = testWallboxResponseBody({ conn_state: connStateResponse });
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(body));

    const state = await service.currentState();

    expect(state.connectionState).toBe(expectedState);
  });

  it('should map power to kW', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(testWallboxResponseBody({ power_w: '7200' })));

    const state = await service.currentState();

    const expectedPower = 7.2 as kW;
    expect(state.power).toBe(expectedPower);
  });

  it('should map duration', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(testWallboxResponseBody({ time_since_charging_start: '390' })));

    const state = await service.currentState();

    const expectedDuration: Duration = dayjs.duration(390, 'seconds');
    expect(state.duration).toEqual(expectedDuration);
  });

  it('should map charged energy', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(testWallboxResponseBody({ transaction_wh: '42500' })));

    const state = await service.currentState();

    const expectedCharged = 42.5 as kWh;
    expect(state.charged).toBe(expectedCharged);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    Container.reset();
  });
});
