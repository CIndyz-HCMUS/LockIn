import { delJson, getJson, postJson } from "./http";

export type WorkoutLog = {
  id: number;
  dateKey: string;
  exerciseId?: number;
  exerciseName: string;
  category: string;
  minutes: number;
  caloriesBurned: number;
  loggedAt: string;
};

export async function listWorkoutLogs(dateKey: string) {
  const sp = new URLSearchParams();
  sp.set("date", dateKey);
  return getJson<{ items: WorkoutLog[] }>(`/logs/workouts?${sp.toString()}`);
}

export async function createWorkoutLog(input: {
  dateKey: string;
  minutes: number;
  exerciseId?: number;
  exerciseName?: string;
  category?: string;
  caloriesBurned?: number;
}) {
  return postJson<WorkoutLog>("/logs/workouts", input);
}

export async function deleteWorkoutLog(id: number) {
  return delJson<{ ok: true }>(`/logs/workouts/${id}`);
}
