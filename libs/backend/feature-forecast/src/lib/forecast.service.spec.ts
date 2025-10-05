import * as ForecastRepository from './forecast.repository';
import { currentForecast, resetCache } from './forecast.service';

describe('currentForecast', () => {
  beforeEach(() => {
    resetCache();
  });

  it('should fetch three forecasts, one for each facing and power', async () => {
    jest
      .spyOn(ForecastRepository, 'fetchPVPro')
      .mockResolvedValue({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100] } });

    await currentForecast();

    expect(ForecastRepository.fetchPVPro).toHaveBeenCalledTimes(3);
    expect(ForecastRepository.fetchPVPro).toHaveBeenCalledWith(142, 1.335);
    expect(ForecastRepository.fetchPVPro).toHaveBeenCalledWith(58, 4.45);
    expect(ForecastRepository.fetchPVPro).toHaveBeenCalledWith(304, 2.67);
  });

  it('should add up the values of the three forecasts, and return their sums', async () => {
    jest
      .spyOn(ForecastRepository, 'fetchPVPro')
      .mockResolvedValueOnce({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100, 200, 300] } })
      .mockResolvedValueOnce({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [101, 201, 301] } })
      .mockResolvedValueOnce({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [102, 202, 302] } });

    const forecast = await currentForecast();

    expect(forecast).toEqual({
      powerValues: [
        { value: 303, unit: 'kW' },
        { value: 603, unit: 'kW' },
        { value: 903, unit: 'kW' },
      ],
    });
  });

  describe('caching', () => {
    beforeEach(() => {
      resetCache();
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return cached data on second call within same period without fetching', async () => {
      const fetchSpy = jest
        .spyOn(ForecastRepository, 'fetchPVPro')
        .mockResolvedValue({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100] } });

      // First call - should fetch
      const forecast1 = await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // Second call - should use cache
      const forecast2 = await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3); // still 3, not 6
      expect(forecast2).toBe(forecast1); // same object reference
    });

    it('should invalidate cache at midnight and fetch fresh data', async () => {
      // set time to 11:30 PM
      jest.setSystemTime(new Date('2024-01-15T23:30:00Z'));

      const fetchSpy = jest
        .spyOn(ForecastRepository, 'fetchPVPro')
        .mockResolvedValue({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100] } });

      // first call at 11:30 PM
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // advance to 12:30 AM (past midnight)
      jest.setSystemTime(new Date('2024-01-16T00:30:00Z'));

      // second call after midnight - should fetch again
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(6); // 3 + 3
    });

    it('should invalidate cache at noon and fetch fresh data', async () => {
      // set time to 11:30 AM
      jest.setSystemTime(new Date('2024-01-15T11:30:00Z'));

      const fetchSpy = jest
        .spyOn(ForecastRepository, 'fetchPVPro')
        .mockResolvedValue({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100] } });

      // first call at 11:30 AM
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // advance to 12:30 PM (past noon)
      jest.setSystemTime(new Date('2024-01-15T12:30:00Z'));

      // second call after noon - should fetch again
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(6); // 3 + 3
    });

    it('should keep cache valid within same period (morning)', async () => {
      // set time to 9:00 AM
      jest.setSystemTime(new Date('2024-01-15T09:00:00Z'));

      const fetchSpy = jest
        .spyOn(ForecastRepository, 'fetchPVPro')
        .mockResolvedValue({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100] } });

      // first call at 9:00 AM
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // advance to 11:30 AM (still morning, before noon)
      jest.setSystemTime(new Date('2024-01-15T11:30:00Z'));

      // second call still in the morning - should use cache
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3); // still 3, not 6
    });

    it('should keep cache valid within same period (afternoon)', async () => {
      // set time to 1:00 PM
      jest.setSystemTime(new Date('2024-01-15T13:00:00Z'));

      const fetchSpy = jest
        .spyOn(ForecastRepository, 'fetchPVPro')
        .mockResolvedValue({ units: { pvpower: 'kW' }, data_1h: { pvpower_instant: [100] } });

      // first call at 1:00 PM
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // advance to 11:00 PM (still afternoon/evening, after noon)
      jest.setSystemTime(new Date('2024-01-15T23:00:00Z'));

      // second call still in PM period - should use cache
      await currentForecast();
      expect(fetchSpy).toHaveBeenCalledTimes(3); // still 3, not 6
    });
  });
});
