import { Container, Service, Token } from 'typedi';
import { WallboxRepository, WallboxRepositoryToken } from './wallbox.repository';
import { ConnectionState, WallboxState } from './wallbox.model';

export interface WallboxService {
  currentState(): Promise<WallboxState>;
}

export const WallboxServiceToken = new Token<WallboxService>('WallboxService');

@Service({ id: WallboxServiceToken })
export class WallboxServiceImpl implements WallboxService {
  async currentState(): Promise<WallboxState> {
    const repository = Container.get<WallboxRepository>(WallboxRepositoryToken);
    const state = await repository.fetch();
    return {
      connectionState: this.mapConnState(state.get('conn_state')),
    };
  }

  //region mappings
  private mapConnState(state: string): ConnectionState {
    switch (state) {
      case ConnectionState.NoVehicleConnected:
        return ConnectionState.NoVehicleConnected;
      default:
        throw new Error(`unknown connection state: ${state}`);
    }
  }
  //endregion
}
