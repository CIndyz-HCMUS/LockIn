import path from "path";
import { env } from "../../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../../storage/jsonStore.js";

export type WorkoutLog = {
  id: number;
  loggedAt: string; // ISO
  exerciseId: number;
  titleSnapshot: string;
  categorySnapshot: "Cardiovascular" | "Strength Training" | string;
  minutes: number;
  caloriesBurned: number;
};

const WORKOUTS_PATH = path.join(env.dataDir, "workoutLogs.json");

export async function listWorkoutsByDate(dateKey: string): Promise<WorkoutLog[]> {
  const all = await readJsonFile<WorkoutLog[]>(WORKOUTS_PATH, []);
  return all.filter((w) => w.loggedAt.startsWith(dateKey));
}

export async function appendWorkout(log: WorkoutLog): Promise<void> {
  await updateJsonFile<WorkoutLog[]>(WORKOUTS_PATH, [], (cur) => [log, ...cur]);
}
