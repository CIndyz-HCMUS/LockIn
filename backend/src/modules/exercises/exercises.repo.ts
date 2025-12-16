import path from "path";
import { env } from "../../config/env.js";
import { readJsonFile, writeJsonFileAtomic } from "../../storage/jsonStore.js";


export type Exercise = {
  id: number;
  title: string;
  category: string; // "Cardiovascular" | "Strength Training" | ...
  met: number;      // chuẩn demo JSON
  isCustom?: boolean;
  createdAt?: string;
};

const SEED_FILE = path.join(env.rootDataDir, "exercises.json");
const CUSTOM_FILE = path.join(env.dataDir, "exercises.custom.json");

async function readSeed(): Promise<Exercise[]> {
  const seed: any[] = await readJsonFile<any[]>(SEED_FILE, []);
  // normalize: title/name
  return seed.map((x) => ({
    id: Number(x.id),
    title: String(x.title ?? x.name ?? "").trim(),
    category: String(x.category ?? "Other"),
    met: Number(x.met ?? 4),
    isCustom: false,
  })).filter((x) => x.id && x.title);
}

async function readCustom(): Promise<Exercise[]> {
  const cur: any[] = await readJsonFile<any[]>(CUSTOM_FILE, []);
  return cur.map((x) => ({
    id: Number(x.id),
    title: String(x.title ?? "").trim(),
    category: String(x.category ?? "Other"),
    met: Number(x.met ?? 4),
    isCustom: true,
    createdAt: x.createdAt,
  })).filter((x) => x.id && x.title);
}
export async function deleteCustomExercise(id: number) {
  const cur = await readJsonFile<any[]>(CUSTOM_FILE, []);
  const next = cur.filter((x) => Number(x.id) !== id);
  const removed = next.length !== cur.length;
  if (removed) await writeJsonFileAtomic(CUSTOM_FILE, next);
  return removed;
}
export async function searchExercises(params: {
  query?: string;
  category?: string; // "all" | ...
  limit?: number;
  offset?: number;
}) {
  const query = String(params.query ?? "").trim().toLowerCase();
  const category = String(params.category ?? "all").trim().toLowerCase();
  const limit = Math.max(1, Math.min(200, Number(params.limit ?? 50)));
  const offset = Math.max(0, Number(params.offset ?? 0));

  const [seed, custom] = await Promise.all([readSeed(), readCustom()]);
  let all = [...custom, ...seed]; // custom lên trước

  if (category && category !== "all") {
    all = all.filter((x) => x.category.toLowerCase() === category);
  }
  if (query) {
    all = all.filter((x) => x.title.toLowerCase().includes(query));
  }

  all.sort((a, b) => a.title.localeCompare(b.title));
  const total = all.length;
  const items = all.slice(offset, offset + limit);

  return { items, total, limit, offset };
}

export async function createExercise(input: {
  title: string;
  category: string;
  met: number;
}) {
  const title = String(input.title ?? "").trim();
  const category = String(input.category ?? "Other").trim();
  const met = Number(input.met);

  if (!title) throw new Error("title required");
  if (!Number.isFinite(met) || met <= 0) throw new Error("met invalid");

  const cur = await readJsonFile<any[]>(CUSTOM_FILE, []);
  const maxId = cur.reduce((m, x) => Math.max(m, Number(x.id) || 0), 100000);
  const id = maxId + 1;

  const created: Exercise = {
    id,
    title,
    category,
    met,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  await writeJsonFileAtomic(CUSTOM_FILE, [created, ...cur]);
  return created;
}

