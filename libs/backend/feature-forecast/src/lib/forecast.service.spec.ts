import * as ForecastRepository from './forecast.repository';
import { currentForecast } from './forecast.service';

describe('currentForecast', () => {
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
});
