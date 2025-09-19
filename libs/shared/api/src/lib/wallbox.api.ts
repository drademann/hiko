import { Measurement } from './general.api';

export interface WallboxStateDTO {
  connectionState: string;
  power: Measurement;
  charged: Measurement;
  duration: Measurement;
}
