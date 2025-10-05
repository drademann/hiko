import { fetchPVPro } from './forecast.repository';
import { Forecast, PowerValue } from './forecast.model';

export async function currentForecast(): Promise<Forecast> {
  const [se, ne, nw] = await Promise.all([fetchPVPro(142, 1.335), fetchPVPro(58, 4.45), fetchPVPro(304, 2.67)]);
  const powerValues = se.data_1h.pvpower_instant.map((_, i) =>
    powerValueOf(se.data_1h.pvpower_instant[i] + ne.data_1h.pvpower_instant[i] + nw.data_1h.pvpower_instant[i], 'kW'),
  );
  return { powerValues: powerValues };
}

function powerValueOf(value: number, unit: string): PowerValue {
  return { value: roundPower(value), unit };
}

function roundPower(value: number): number {
  return Math.round(value * 10) / 10;
}
