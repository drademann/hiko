import { WallboxRepository } from './wallbox.repository';

describe('WallboxRepository', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('fetch() should call the wallbox endpoint and parse colon-separated lines into a Map', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(`conn_state:charging\npower:7.2\n`));

    const repo = new WallboxRepository();

    const result = await repo.fetch();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('http://192.168.178.72/rest/full_state');

    expect(result).toBeInstanceOf(Map);
    expect(result.get('conn_state')).toBe('charging');
    expect(result.get('power')).toBe('7.2'); // trims
  });
});
