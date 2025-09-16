export interface PVProBody {
  units: {
    pvpower: string;
  };
  pvpower_instant: number[];
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
  const meteoblueURL = `
    http://${process.env['METEOBLUE_HOST']}/packages/pvpro-1h \
        ?lat=${lat}&lon=${lon}&asl=40 \
        &facing=${facing}&slope=25 \
        &power=${power} \
        &power_efficiency=0.85 \
        &apikey=${apiKey} \
        &tz=Europe%2FBerlin \
        &forecast_days=1
  `;
  const res = await fetch(meteoblueURL);
  return await res.json();
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
