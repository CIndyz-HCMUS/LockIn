import { getJson, postJson, delJson } from "./http";

export type SleepLog = { id: number; loggedAt: string; minutes: number };

export async function listSleepLogs(dateKey: string) {
  return getJson<{ items: SleepLog[] }>(`/logs/sleep?date=${dateKey}`);
}
export async function createSleepLog(payload: { dateKey: string; minutes: number }) {
  return postJson<SleepLog>("/logs/sleep", payload);
}
export async function deleteSleepLog(id: number) {
  return delJson<{ ok: true }>(`/logs/sleep/${id}`);
}
function minutesBetween(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;

  let diff = Math.round((end - start) / 60000);
  if (diff <= 0) diff += 24 * 60; // qua ngày
  return diff;
}

// Alias for UI components expecting addSleep()
export async function addSleep(startIso: string, endIso: string, _quality?: number) {
  const dateKey = startIso.slice(0, 10);
  const minutes = minutesBetween(startIso, endIso);
  return createSleepLog({ dateKey, minutes });
}
