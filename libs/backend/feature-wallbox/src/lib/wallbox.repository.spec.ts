import { fetchWallboxState } from './wallbox.repository';

describe('WallboxRepository', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, WALLBOX_HOST: 'wallbox-test-host' };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('fetch() should call the wallbox endpoint and parse colon-separated lines into a Map', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(`
          conn_state:charging
          power_w: 7200
          time_since_charging_start:390
          transaction_wh: 42500`),
    );

    const result = await fetchWallboxState();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('http://wallbox-test-host/rest/full_state');

    expect(result).toBeInstanceOf(Map);
    expect(result.get('conn_state')).toBe('charging');
    expect(result.get('power_w')).toBe('7200'); // trims
    expect(result.get('time_since_charging_start')).toBe('390');
    expect(result.get('transaction_wh')).toBe('42500');
  });
});

export function testWallboxResponseBody({
  conn_state = 'no_vehicle_connected',
  power_w = '7200',
  time_since_charging_start = '390',
  transaction_wh = '42500',
} = {}): string {
  return `
    conn_state:${conn_state}
    power_w:${power_w}
    time_since_charging_start:${time_since_charging_start}
    transaction_wh:${transaction_wh}
  `;
}
