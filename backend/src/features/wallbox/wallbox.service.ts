import { Inject, Service } from 'typedi';
import { WallboxService, WallboxServiceToken } from './wallbox.api';
import { WallboxRepository } from './wallbox.repository';
import { ConnectionState, WallboxState } from './wallbox.model';

@Service({ id: WallboxServiceToken })
export class WallboxServiceImpl implements WallboxService {
  constructor(@Inject() private repository: WallboxRepository) {}

  async currentState(): Promise<WallboxState> {
    return this.repository.fetch().then((state) => ({
      connectionState: this.mapConnState(state.get('conn_state')),
    }));
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
