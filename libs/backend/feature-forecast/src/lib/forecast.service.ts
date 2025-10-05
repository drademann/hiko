import { fetchPVPro } from './forecast.repository';
import { Forecast, PowerValue } from './forecast.model';
import { createLogger } from '@hiko/backend-middleware';

const log = createLogger({ service: 'forecast' });

interface CachedForecast {
  forecast: Forecast;
  cachedAt: Date;
}

let cache: CachedForecast | null = null;

function getCachePeriod(time: Date): string {
  const date = time.toISOString().split('T')[0];
  const period = time.getUTCHours() < 12 ? 'AM' : 'PM';
  return `${date}-${period}`;
}

function isCacheValid(cachedAt: Date): boolean {
  return getCachePeriod(cachedAt) === getCachePeriod(new Date());
}

export function resetCache(): void {
  cache = null;
}

export async function currentForecast(): Promise<Forecast> {
  if (cache && isCacheValid(cache.cachedAt)) {
    log.debug('Returning cached forecast', {
      cachedAt: cache.cachedAt.toISOString(),
      cachePeriod: getCachePeriod(cache.cachedAt),
    });
    return cache.forecast;
  }
  log.info('Fetching fresh forecast data', {
    reason: cache ? 'cache expired' : 'no cache',
    previousCachePeriod: cache ? getCachePeriod(cache.cachedAt) : undefined,
  });

  const [se, ne, nw] = await Promise.all([fetchPVPro(142, 1.335), fetchPVPro(58, 4.45), fetchPVPro(304, 2.67)]);
  const powerValues = se.data_1h.pvpower_instant.map((_, i) =>
    powerValueOf(se.data_1h.pvpower_instant[i] + ne.data_1h.pvpower_instant[i] + nw.data_1h.pvpower_instant[i], 'kW'),
  );
  const forecast = { powerValues: powerValues };
  const now = new Date();
  cache = { forecast, cachedAt: now };

  log.info('Cached fresh forecast data', {
    cachedAt: now.toISOString(),
    cachePeriod: getCachePeriod(now),
    dataPoints: powerValues.length,
  });

  return forecast;
}

function powerValueOf(value: number, unit: string): PowerValue {
  return { value: roundPower(value), unit };
}

function roundPower(value: number): number {
  return Math.round(value * 10) / 10;
}
