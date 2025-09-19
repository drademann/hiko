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
    };

    expect(dto).toBeDefined();
  });
});
