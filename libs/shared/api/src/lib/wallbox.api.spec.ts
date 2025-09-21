import { Unit } from './general.api';
import { WallboxStateDTO } from './wallbox.api';

describe('api', () => {
  it('should provide types for wallbox', async () => {
    const dto: WallboxStateDTO = {
      connectionState: 'NoVehicleConnected',
      charged: {
        value: 42,
        unit: Unit.kWh,
      },
      duration: {
        value: 3600,
        unit: Unit.Seconds,
      },
      power: {
        value: 11.3,
        unit: Unit.kW,
      },
      ambientTemperature: {
        value: 22.5,
        unit: Unit.Celsius,
      },
    };

    expect(dto).toBeDefined();
  });
});
