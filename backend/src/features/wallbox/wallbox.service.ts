import { Container, Service, Token } from 'typedi';
import { Logger, LoggerToken } from '../../core/logger.service';
import { WallboxRepository, WallboxRepositoryToken } from './wallbox.repository';
import { ConnectionState, WallboxState } from './wallbox.model';

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
    return { connectionState: this.mapConnState(state.get('conn_state')) };
  }

  //region mappings
  private mapConnState(state: string): ConnectionState {
    switch (state) {
      case 'no_vehicle_connected':
        return ConnectionState.NoVehicleConnected;
      case 'vehicle_connected_type2':
        return ConnectionState.ConnectedNotLoading;
      case 'vehicle_charging_type2':
        return ConnectionState.ConnectedLoading;
      default:
        throw new Error(`unknown connection state: ${state}`);
    }
  }
  //endregion
}
