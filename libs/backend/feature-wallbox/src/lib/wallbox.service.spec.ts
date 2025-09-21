import { ConnectionState, kW, kWh, Celsius } from './wallbox.model';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { testWallboxResponseBody } from './wallbox.repository.spec';
import { currentWallboxState } from './wallbox.service';

const createMockLogger = () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
});

describe('WallboxService', () => {
  beforeEach(() => {
    jest.mock('@hiko/backend-middleware', () => ({
      createLogger: jest.fn(() => createMockLogger()),
    }));
  });

  test.each([
    ['no_vehicle_connected', ConnectionState.NoVehicleConnected],
    ['vehicle_connected_type2', ConnectionState.ConnectedNotCharging],
    ['vehicle_charging_type2', ConnectionState.ConnectedCharging],
  ])('should map "%s" to %s', async (connStateResponse, expectedState) => {
    const body = testWallboxResponseBody({ conn_state: connStateResponse });
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(body));

    const state = await currentWallboxState();

    expect(state.connectionState).toBe(expectedState);
  });

  it('should map power to kW', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(testWallboxResponseBody({ power_w: '7200' })));

    const state = await currentWallboxState();

    const expectedPower = 7.2 as kW;
    expect(state.power).toBe(expectedPower);
  });

  it('should map duration', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(testWallboxResponseBody({ time_since_charging_start: '390' })));

    const state = await currentWallboxState();

    const expectedDuration: Duration = dayjs.duration(390, 'seconds');
    expect(state.duration).toEqual(expectedDuration);
  });

  it('should map charged energy', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(testWallboxResponseBody({ transaction_wh: '42500' })));

    const state = await currentWallboxState();

    const expectedCharged = 42.5 as kWh;
    expect(state.charged).toBe(expectedCharged);
  });

  it('should map ambient temperature', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(testWallboxResponseBody({ ambient_temp: '18.7' })));

    const state = await currentWallboxState();

    const expectedTemperature = 18.7 as Celsius;
    expect(state.ambientTemperature).toBe(expectedTemperature);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
});
