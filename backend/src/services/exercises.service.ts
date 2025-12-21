// backend/src/services/exercises.service.ts
import type { Exercise } from "../repos/exercises.repo.js";
import { listExercises } from "../repos/exercises.repo.js";

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

/**
 * Search exercises by optional query + category.
 * - query: match title contains
 * - category: match category equals
 */
export async function searchExercises(params?: {
  query?: string;
  category?: string;
}): Promise<Exercise[]> {
  const all = await listExercises();

  const q = norm(params?.query);
  const cat = norm(params?.category);

  let out = all;

  if (cat) out = out.filter((x) => norm(x.category) === cat);
  if (q) out = out.filter((x) => norm(x.title).includes(q));

  return out;
}

/**
 * Convenience: list all (no filters)
 */
export async function listAllExercises(): Promise<Exercise[]> {
  return listExercises();
}
