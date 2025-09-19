import { fetchPVPro } from './forecast.repository';
import { Forecast, PowerValue } from './forecast.model';

export async function currentForecast(): Promise<Forecast> {
  const [se, ne, nw] = await Promise.all([fetchPVPro(142, 1.335), fetchPVPro(58, 4.45), fetchPVPro(304, 2.67)]);
  const powerValues = se.pvpower_instant.map((_, i) =>
    powerValueOf(se.pvpower_instant[i] + ne.pvpower_instant[i] + nw.pvpower_instant[i], 'kW'),
  );
  return { powerValues: powerValues };
}

function powerValueOf(value: number, unit: string): PowerValue {
  return { value, unit };
}
