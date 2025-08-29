import { Service, Token } from 'typedi';

export const WallboxRepositoryToken = new Token<WallboxRepository>('WallboxRepository');

// noinspection HttpUrlsUsage
const wallboxURL = `http://${process.env.WALLBOX_HOST}/rest/full_state`;

@Service({ id: WallboxRepositoryToken })
export class WallboxRepository {
  async fetch(): Promise<Map<string, string>> {
    const res = await fetch(wallboxURL);
    const body = await res.text();
    const pairs = body.split('\n').map((line) => line.split(':').map((s) => s.trim()) as [string, string]);
    return new Map(pairs);
  }
}
