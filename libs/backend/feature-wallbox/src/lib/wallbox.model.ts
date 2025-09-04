import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Duration } from 'dayjs/plugin/duration';

dayjs.extend(duration);

export type WallboxState = {
  connectionState: ConnectionState;
  power: kW;
  charged: kWh;
  duration: Duration;
};

export enum ConnectionState {
  NoVehicleConnected,
  ConnectedNotCharging,
  ConnectedCharging,
}

export type kW = number & { __brand: 'kW' };
export type kWh = number & { __brand: 'kWh' };
