import path from "path";
import { env } from "../../config/env.js";
import { readJsonFile } from "../../storage/jsonStore.js";

export type RelaxationCategory = "Breathing" | "Stretching" | "Mindfulness" | "Recovery" | "Other";

export type RelaxationActivity = {
  id: number;
  title: string;
  category: RelaxationCategory;
  desc: string;
  steps?: string[];
  suggestedMinutes?: number;
  isVerified?: boolean;
  createdAt?: string;
  imageUri?: string | null;
};

const FILE = path.join(env.dataDir, "relaxations.json");

export async function searchRelaxations(params: {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: RelaxationActivity[]; total: number; limit: number; offset: number }> {
  const q = (params.q ?? "").trim().toLowerCase();
  const category = (params.category ?? "").trim();
  const limit = Math.max(1, Math.min(200, Number(params.limit ?? 50)));
  const offset = Math.max(0, Number(params.offset ?? 0));

  const all = await readJsonFile<RelaxationActivity[]>(FILE, []);

  let filtered = all;

  if (category) filtered = filtered.filter((x: RelaxationActivity) => x.category === category);

  if (q) {
    filtered = filtered.filter((x: RelaxationActivity) => {
      const hay = `${x.title} ${x.desc}`.toLowerCase();
      return hay.includes(q);
    });
  }

  filtered = filtered.sort((a: RelaxationActivity, b: RelaxationActivity) => {
    const av = a.isVerified ? 1 : 0;
    const bv = b.isVerified ? 1 : 0;
    if (av !== bv) return bv - av;
    return a.title.localeCompare(b.title);
  });

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);
  return { items, total, limit, offset };
}
