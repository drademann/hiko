import { Service } from 'typedi';

@Service()
export class WallboxRepository {
  async fetch(): Promise<Map<string, string>> {
    const res = await fetch('http://192.168.178.72/rest/full_state');
    return res
      .text()
      .then((body) => body.split('\n'))
      .then((lines) => lines.map((line) => line.split(':').map((s) => s.trim()) as [string, string]))
      .then((pairs) => new Map(pairs));
  }
}
