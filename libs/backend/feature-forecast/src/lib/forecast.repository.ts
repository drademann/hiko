export interface PVProBody {
  units: {
    pvpower: string;
  };
  pvpower_instant: number[];
}

export async function fetchPVPro(): Promise<PVProBody> {
  // noinspection HttpUrlsUsage
  const meteoblueURL = `http://${process.env['METEOBLUE_HOST']}/packages/pvpro-1h`;
  const res = await fetch(meteoblueURL);
  return await res.json();
}
