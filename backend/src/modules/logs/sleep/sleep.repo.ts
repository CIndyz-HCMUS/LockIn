import path from "path";
import { env } from "../../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../../storage/jsonStore.js";

export type SleepLog = {
  id: number;
  loggedAt: string;
  minutes: number;
};

const FILE = path.join(env.dataDir, "sleepLogs.json");

export async function listSleepByDate(dateKey: string): Promise<SleepLog[]> {
  const all = await readJsonFile<SleepLog[]>(FILE, []);
  return all.filter((x) => String(x.loggedAt).startsWith(dateKey));
}

export async function appendSleep(log: SleepLog) {
  await updateJsonFile<SleepLog[]>(FILE, [], (cur) => [log, ...cur]);
}

export async function deleteSleep(id: number): Promise<boolean> {
  let removed = false;
  await updateJsonFile<SleepLog[]>(FILE, [], (cur) => {
    const before = cur.length;
    const next = cur.filter((x) => x.id !== id);
    removed = next.length !== before;
    return next;
  });
  return removed;
}
