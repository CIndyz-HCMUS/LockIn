import path from "path";
import { env } from "../../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../../storage/jsonStore.js";

export type StepsLog = {
  id: number;
  loggedAt: string;
  steps: number;
};

const FILE = path.join(env.dataDir, "stepsLogs.json");

export async function listStepsByDate(dateKey: string): Promise<StepsLog[]> {
  const all = await readJsonFile<StepsLog[]>(FILE, []);
  return all.filter((x) => String(x.loggedAt).startsWith(dateKey));
}

export async function appendSteps(log: StepsLog) {
  await updateJsonFile<StepsLog[]>(FILE, [], (cur) => [log, ...cur]);
}

export async function deleteSteps(id: number): Promise<boolean> {
  let removed = false;
  await updateJsonFile<StepsLog[]>(FILE, [], (cur) => {
    const before = cur.length;
    const next = cur.filter((x) => x.id !== id);
    removed = next.length !== before;
    return next;
  });
  return removed;
}
