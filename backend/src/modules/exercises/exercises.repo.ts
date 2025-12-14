import path from "path";
import { env } from "../../config/env";
import { readJsonFile } from "../../storage/jsonStore";

export type Exercise = {
  id: number;
  title: string;
  category: string;
  caloriesPerMinute: number;
  desc?: string;
  isVerified?: boolean;
  createdAt?: string;
};

const FILE = path.join(env.dataDir, "exercises.json");

export async function searchExercises(params: {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const q = (params.q ?? "").trim().toLowerCase();
  const category = (params.category ?? "").trim();
  const limit = Math.max(1, Math.min(200, Number(params.limit ?? 50)));
  const offset = Math.max(0, Number(params.offset ?? 0));

  const all = await readJsonFile<Exercise[]>(FILE, []);

  let filtered = all;

  if (category) filtered = filtered.filter((x) => x.category === category);

  if (q) {
    filtered = filtered.filter((x) => {
      const hay = `${x.title} ${x.desc ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);
  return { items, total, limit, offset };
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  const all = await readJsonFile<Exercise[]>(FILE, []);
  return all.find((x) => x.id === id) ?? null;
}
