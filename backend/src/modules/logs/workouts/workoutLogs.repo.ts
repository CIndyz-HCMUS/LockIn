import path from "path";
import { env } from "../../../config/env";
import { readJsonFile, writeJsonFileAtomic } from "../../../storage/jsonStore";
import { getExerciseById } from "../../exercises/exercises.repo";

export type WorkoutLog = {
  id: number;
  dateKey: string; // YYYY-MM-DD
  exerciseId?: number;
  exerciseName: string;
  category: string;
  minutes: number;
  caloriesBurned: number;
  loggedAt: string; // ISO
};

const FILE = path.join(env.dataDir, "workoutLogs.json");

export async function listWorkoutLogs(dateKey: string): Promise<{ items: WorkoutLog[] }> {
  const all = await readJsonFile<WorkoutLog[]>(FILE, []);
  const items = all
    .filter((x) => x.dateKey === dateKey)
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  return { items };
}

export async function createWorkoutLog(input: {
  dateKey: string;
  exerciseId?: number;
  exerciseName?: string;
  category?: string;
  minutes: number;
  caloriesBurned?: number;
}): Promise<WorkoutLog> {
  const cur = await readJsonFile<WorkoutLog[]>(FILE, []);
  const nextId = cur.reduce((m, x) => Math.max(m, x.id), 0) + 1;

  const now = new Date().toISOString();

  let exerciseName = (input.exerciseName ?? "").trim();
  let category = (input.category ?? "").trim();
  let caloriesBurned = Number(input.caloriesBurned ?? 0);

  // ✅ nếu có exerciseId: lookup và tự tính calories
  if (input.exerciseId != null) {
    const ex = await getExerciseById(Number(input.exerciseId));
    if (ex) {
      exerciseName = ex.title;
      category = ex.category;
      caloriesBurned = Math.round(Number(input.minutes) * Number(ex.caloriesPerMinute));
    }
  }

  if (!exerciseName) throw new Error("exerciseName missing");
  if (!category) category = "Other";

  if (!Number.isFinite(caloriesBurned) || caloriesBurned < 0) caloriesBurned = 0;

  const created: WorkoutLog = {
    id: nextId,
    dateKey: input.dateKey,
    exerciseId: input.exerciseId,
    exerciseName,
    category,
    minutes: Number(input.minutes),
    caloriesBurned,
    loggedAt: now,
  };

  await writeJsonFileAtomic(FILE, [created, ...cur]);
  return created;
}

export async function deleteWorkoutLog(id: number): Promise<boolean> {
  const cur = await readJsonFile<WorkoutLog[]>(FILE, []);
  const next = cur.filter((x) => x.id !== id);
  const removed = next.length !== cur.length;
  if (removed) await writeJsonFileAtomic(FILE, next);
  return removed;
}
