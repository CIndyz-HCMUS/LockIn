import { getJson, postJson, delJson } from "./http";

export type StepsLog = { id: number; loggedAt: string; steps: number };

export async function listStepsLogs(dateKey: string) {
  return getJson<{ items: StepsLog[] }>(`/logs/steps?date=${dateKey}`);
}
export async function createStepsLog(payload: { dateKey: string; steps: number }) {
  return postJson<StepsLog>("/logs/steps", payload);
}
export async function deleteStepsLog(id: number) {
  return delJson<{ ok: true }>(`/logs/steps/${id}`);
}
// Alias for UI components expecting setSteps()
export async function setSteps(dateKey: string, steps: number) {
  return createStepsLog({ dateKey, steps });
}
