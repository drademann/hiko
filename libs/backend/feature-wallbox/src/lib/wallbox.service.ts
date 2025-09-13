import { ConnectionState, kW, kWh, WallboxState } from './wallbox.model';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { fetchWallboxState } from './wallbox.repository';

export async function currentWallboxState(): Promise<WallboxState> {
  const rawState = await fetchWallboxState();
  return {
    connectionState: mapConnState(rawState.get('conn_state')),
    power: mapPower(rawState.get('power_w')),
    charged: mapCharged(rawState.get('transaction_wh')),
    duration: mapDuration(rawState.get('time_since_charging_start')),
  };
}

//region mappings
function mapConnState(value: string | undefined): ConnectionState {
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

function mapPower(value: string | undefined): kW {
  if (!value) {
    throw new Error('power value is undefined');
  }
  return (parseFloat(value) / 1000.0) as kW;
}

function mapCharged(value: string | undefined): kWh {
  if (!value) {
    throw new Error('charged value is undefined');
  }
  return (parseFloat(value) / 1000.0) as kWh;
}

function mapDuration(value: string | undefined): Duration {
  if (!value) {
    throw new Error('duration value is undefined');
  }
  return dayjs.duration(parseInt(value), 'seconds');
}
//endregion
