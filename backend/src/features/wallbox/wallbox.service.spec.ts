import { WallboxRepository, WallboxRepositoryToken } from './wallbox.repository';
import { WallboxService, WallboxServiceImpl } from './wallbox.service';
import { ConnectionState, kW, kWh } from './wallbox.model';
import { Container } from 'typedi';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

describe('WallboxService', () => {
  let service: WallboxService;

  beforeEach(() => {
    Container.set(WallboxRepositoryToken, new WallboxRepository());
    service = new WallboxServiceImpl();
  });

  test.each([
    ['conn_state: no_vehicle_connected', ConnectionState.NoVehicleConnected],
    ['conn_state: vehicle_connected_type2', ConnectionState.ConnectedNotCharging],
    ['conn_state: vehicle_charging_type2', ConnectionState.ConnectedCharging],
  ])('should map "%s" to %s', async (response, expectedState) => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(response));

    const state = await service.currentState();

    expect(state.connectionState).toBe(expectedState);
  });

  it('should map power to kW', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(`
      conn_state: vehicle_charging_type2
      power_w:7200
    `),
    );

    const state = await service.currentState();

    const expectedPower = 7.2 as kW;
    expect(state.power).toBe(expectedPower);
  });

  it('should map duration', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(`
      conn_state: vehicle_charging_type2
      time_since_charging_start:390
    `),
    );

    const state = await service.currentState();

    const expectedDuration: Duration = dayjs.duration(390, 'seconds');
    expect(state.duration).toEqual(expectedDuration);
  });

  it('should map charged energy', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(`
      conn_state: vehicle_charging_type2
      transaction_wh:42500
    `),
    );

    const state = await service.currentState();

    const expectedCharged = 42.5 as kWh;
    expect(state.charged).toBe(expectedCharged);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
});
