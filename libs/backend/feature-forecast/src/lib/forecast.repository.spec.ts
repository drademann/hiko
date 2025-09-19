import { fetchPVPro, PVProBody } from './forecast.repository';

describe('fetchPVPro', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      HOME_LAT: '50.123',
      HOME_LON: '8.678',
      METEOBLUE_API_KEY: 'test-key',
      METEOBLUE_HOST: 'meteoblue.test',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('throws when HOME_LAT is not a number', async () => {
    process.env['HOME_LAT'] = 'invalid';

    await expect(fetchPVPro(90, 5)).rejects.toThrow('HOME_LAT is not a number');
  });

  it('throws when HOME_LON is not a number', async () => {
    process.env['HOME_LON'] = 'invalid';

    await expect(fetchPVPro(90, 5)).rejects.toThrow('HOME_LON is not a number');
  });

  it('throws when METEOBLUE_API_KEY is not set', async () => {
    delete process.env['METEOBLUE_API_KEY'];

    await expect(fetchPVPro(90, 5)).rejects.toThrow('METEOBLUE_API_KEY is not set');
  });

  it('throws when facing is less than 0 or greater than 359', async () => {
    await expect(fetchPVPro(-1, 5)).rejects.toThrow('facing must be between 0 and 359');
    await expect(fetchPVPro(360, 5)).rejects.toThrow('facing must be between 0 and 359');
  });

  it('throws when power is less than 0', async () => {
    await expect(fetchPVPro(90, -5)).rejects.toThrow('power must be greater than 0');
  });

  it('calls the meteoblue API with configured parameters and returns the response body', async () => {
    const responseBody: PVProBody = {
      units: { pvpower: 'kW' },
      data_1h: { pvpower_instant: [1200, 1100, 900] },
    };
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(responseBody)));

    const result = await fetchPVPro(180, 7);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('http://meteoblue.test/packages/pvpro-1h');
    expect(calledUrl).toContain('?lat=50.123&lon=8.678&asl=40');
    expect(calledUrl).toContain('&facing=180');
    expect(calledUrl).toContain('&slope=25');
    expect(calledUrl).toContain('&kwp=7');
    expect(calledUrl).toContain('&power_efficiency=0.85');
    expect(calledUrl).toContain('&apikey=test-key');
    expect(calledUrl).toContain('&tz=Europe%2FBerlin');
    expect(calledUrl).toContain('&forecast_days=1');
    expect(result).toEqual(responseBody);
  });
});
