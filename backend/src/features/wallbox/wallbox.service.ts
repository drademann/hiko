import { Container, Service, Token } from 'typedi';
import { Logger, LoggerToken } from '../../core/logger.service';
import { WallboxRepository, WallboxRepositoryToken } from './wallbox.repository';
import { ConnectionState, kW, kWh, WallboxState } from './wallbox.model';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

export interface WallboxService {
  currentState(): Promise<WallboxState>;
}

export const WallboxServiceToken = new Token<WallboxService>('WallboxService');

@Service({ id: WallboxServiceToken })
export class WallboxServiceImpl implements WallboxService {
  private logger = Container.get<Logger>(LoggerToken).child({ service: 'WallboxService' });

  async currentState(): Promise<WallboxState> {
    this.logger.debug('getting current wallbox state');
    const repository = Container.get<WallboxRepository>(WallboxRepositoryToken);
    const state = await repository.fetch();
    return {
      connectionState: this.mapConnState(state.get('conn_state')),
      power: this.mapPower(state.get('power_w')),
      charged: this.mapCharged(state.get('transaction_wh')),
      duration: this.mapDuration(state.get('time_since_charging_start')),
    };
  }

  //region mappings
  private mapConnState(value: string): ConnectionState {
    switch (value) {
      case 'no_vehicle_connected':
        return ConnectionState.NoVehicleConnected;
      case 'vehicle_connected_type2':
        return ConnectionState.ConnectedNotCharging;
      case 'vehicle_charging_type2':
        return ConnectionState.ConnectedCharging;
      default:
        throw new Error(`unknown connection state: ${value}`);
    }
  }

  private mapPower(value: string): kW {
    return (parseFloat(value) / 1000.0) as kW;
  }

  private mapCharged(value: string): kWh {
    return (parseFloat(value) / 1000.0) as kWh;
  }

  private mapDuration(value: string): Duration {
    return dayjs.duration(parseInt(value), 'seconds');
  }
  //endregion
}
