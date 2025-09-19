export interface PVProBody {
  units: {
    pvpower: string;
  };
  data_1h: {
    pvpower_instant: number[];
  };
}

export async function fetchPVPro(facing: number, power: number): Promise<PVProBody> {
  if (facing < 0 || facing >= 360) {
    throw new Error('facing must be between 0 and 359');
  }
  if (power <= 0) {
    throw new Error('power must be greater than 0');
  }
  const { lat, lon, apiKey } = PVProConfig();
  // noinspection HttpUrlsUsage
  const meteoblueURL = `http://${process.env['METEOBLUE_HOST']}/packages/pvpro-1h?lat=${lat}&lon=${lon}&asl=40&facing=${facing}&slope=25&kwp=${power}&power_efficiency=0.85&apikey=${apiKey}&tz=Europe%2FBerlin&forecast_days=1`;
  const res = await fetch(meteoblueURL);
  if (!res.ok) {
    throw new Error(`failed to fetch PVPro data: ${res.statusText}`);
  }
  const payload = await res.json();
  if (!isPVProBody(payload)) {
    throw new Error('failed to fetch PVPro data: invalid response shape');
  }
  return payload;
}

function isPVProBody(payload: unknown): payload is PVProBody {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const { units, data_1h } = payload as Record<string, unknown>;
  if (!units || typeof units !== 'object') {
    return false;
  }
  if (typeof (units as Record<string, unknown>)['pvpower'] !== 'string') {
    return false;
  }
  if (!data_1h || typeof data_1h !== 'object') {
    return false;
  }
  const { pvpower_instant } = data_1h as Record<string, unknown>;
  if (!Array.isArray(pvpower_instant)) {
    return false;
  }
  return pvpower_instant.every((value) => typeof value === 'number');
}

function PVProConfig() {
  const lat = Number(process.env['HOME_LAT']);
  if (isNaN(lat)) {
    throw new Error('HOME_LAT is not a number');
  }
  const lon = Number(process.env['HOME_LON']);
  if (isNaN(lon)) {
    throw new Error('HOME_LON is not a number');
  }
  const apiKey = process.env['METEOBLUE_API_KEY'];
  if (!apiKey) {
    throw new Error('METEOBLUE_API_KEY is not set');
  }
  return { lat, lon, apiKey };
}
