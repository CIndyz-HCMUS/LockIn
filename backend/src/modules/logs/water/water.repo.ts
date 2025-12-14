import path from "path";
import { env } from "../../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../../storage/jsonStore.js";

export type WaterLog = {
  id: number;
  loggedAt: string; // ISO
  ml: number;
};

const FILE = path.join(env.dataDir, "waterLogs.json");

export async function listWaterByDate(dateKey: string): Promise<WaterLog[]> {
  const all = await readJsonFile<WaterLog[]>(FILE, []);
  return all.filter((x) => String(x.loggedAt).startsWith(dateKey));
}

export async function appendWater(log: WaterLog) {
  await updateJsonFile<WaterLog[]>(FILE, [], (cur) => [log, ...cur]);
}

export async function deleteWater(id: number): Promise<boolean> {
  let removed = false;
  await updateJsonFile<WaterLog[]>(FILE, [], (cur) => {
    const before = cur.length;
    const next = cur.filter((x) => x.id !== id);
    removed = next.length !== before;
    return next;
  });
  return removed;
}
