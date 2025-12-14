import path from "path";
import { env } from "../../config/env";
import { readJsonFile, updateJsonFile } from "../../storage/jsonStore";


export type RelaxationLog = {
  id: number;
  dateKey: string; // YYYY-MM-DD
  activityId: number;
  activityTitle: string;
  minutes: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
  loggedAt: string; // ISO
};

const FILE = path.join(env.dataDir, "relaxationLogs.json");

export async function listRelaxationLogs(dateKey: string): Promise<{ items: RelaxationLog[] }> {
  const all = await readJsonFile<RelaxationLog[]>(FILE, []);
  const items = all
    .filter((x: RelaxationLog) => x.dateKey === dateKey)
    .sort((a: RelaxationLog, b: RelaxationLog) => b.loggedAt.localeCompare(a.loggedAt));
  return { items };
}

export async function createRelaxationLog(
  input: Omit<RelaxationLog, "id" | "loggedAt">
): Promise<RelaxationLog> {
  const now = new Date().toISOString();
  let created!: RelaxationLog;

  await updateJsonFile<RelaxationLog[]>(FILE, [], (cur: RelaxationLog[]) => {
    const nextId = cur.reduce((m: number, x: RelaxationLog) => Math.max(m, x.id), 0) + 1;
    created = { id: nextId, loggedAt: now, ...input };
    return [created, ...cur];
  });

  return created;
}

export async function deleteRelaxationLog(id: number): Promise<boolean> {
  let removed = false;

  await updateJsonFile<RelaxationLog[]>(FILE, [], (cur: RelaxationLog[]) => {
    const next = cur.filter((x: RelaxationLog) => {
      if (x.id === id) {
        removed = true;
        return false;
      }
      return true;
    });
    return next;
  });

  return removed;
}
