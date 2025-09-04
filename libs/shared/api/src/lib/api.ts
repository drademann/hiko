export interface WallboxStateDTO {
  connectionState: string;
  power: Measurement;
  charged: Measurement;
  duration: Measurement;
}

export interface Measurement {
  value: number;
  unit: Unit;
}

export enum Unit {
  kWh = 'kWh',
  kW = 'kW',
  Seconds = 'Seconds',
}
