import path from "path";
import { env } from "../../config/env.js";
import { readJsonFile } from "../../storage/jsonStore.js";

export type Exercise = {
  id: number;
  name: string;
  category: string; // Cardiovascular / Strength Training / ...
  met: number;
};

const FILE = path.join(env.rootDataDir, "exercises.json");

export async function readAllExercises(): Promise<Exercise[]> {
  return readJsonFile<Exercise[]>(FILE, []);
}

export async function searchExercises(params: {
  query: string;
  category?: string;
  limit: number;
  offset: number;
}): Promise<{ items: Exercise[]; total: number }> {
  const { query, category, limit, offset } = params;

  const all = await readAllExercises();
  const q = query.trim().toLowerCase();
  const c = (category ?? "").trim().toLowerCase();

  let filtered = all;

  if (q.length > 0) {
    filtered = filtered.filter((x) => (x.name ?? "").toLowerCase().includes(q));
  }

  if (c.length > 0 && c !== "all") {
    filtered = filtered.filter((x) => (x.category ?? "").toLowerCase() === c);
  }

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);
  return { items, total };
}
