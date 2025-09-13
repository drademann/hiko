import { Service, Token } from 'typedi';

export interface PVProBody {
  units: {
    pvpower: string;
  };
  pvpower_instant: number[];
}

export const ForecastRepositoryToken = new Token<ForecastRepository>('ForecastRepository');

@Service({ id: ForecastRepositoryToken })
export class ForecastRepository {
  async fetch(): Promise<PVProBody> {
    // noinspection HttpUrlsUsage
    const meteoblueURL = `http://${process.env['METEOBLUE_HOST']}/packages/pvpro-1h`;
    const res = await fetch(meteoblueURL);
    return await res.json();
  }
}
