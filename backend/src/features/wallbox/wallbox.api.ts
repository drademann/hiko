import { Token } from 'typedi';
import { WallboxState } from './wallbox.model';

export interface WallboxService {
  currentState(): Promise<WallboxState>;
}

export const WallboxServiceToken = new Token<WallboxService>('WallboxService');
