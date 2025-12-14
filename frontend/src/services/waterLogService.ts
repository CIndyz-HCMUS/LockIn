import { getJson, postJson, delJson } from "./http";

export type WaterLog = { id: number; loggedAt: string; ml: number };

export async function listWaterLogs(dateKey: string) {
  return getJson<{ items: WaterLog[] }>(`/logs/water?date=${dateKey}`);
}
export async function createWaterLog(payload: { dateKey: string; ml: number }) {
  return postJson<WaterLog>("/logs/water", payload);
}
export async function deleteWaterLog(id: number) {
  return delJson<{ ok: true }>(`/logs/water/${id}`);
}
// Alias for UI components expecting addWater()
export async function addWater(dateKey: string, ml: number) {
  return createWaterLog({ dateKey, ml });
}
