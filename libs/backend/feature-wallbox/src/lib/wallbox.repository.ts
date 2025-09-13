export async function fetchWallboxState(): Promise<Map<string, string>> {
  // noinspection HttpUrlsUsage
  const wallboxURL = `http://${process.env['WALLBOX_HOST']}/rest/full_state`;
  const res = await fetch(wallboxURL);
  const body = await res.text();
  const pairs = body.split('\n').map((line) => line.split(':').map((s) => s.trim()) as [string, string]);
  return new Map(pairs);
}
