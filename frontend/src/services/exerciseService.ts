import { getJson, postJson } from "./http";

export type Exercise = {
  id: number;
  title: string;
  category: string;
  met?: number;
};

export type WorkoutLog = {
  id: number;
  loggedAt: string;
  exerciseId: number;
  titleSnapshot: string;
  categorySnapshot: string;
  minutes: number;
  caloriesBurned: number;
};

export async function searchExercises(query: string): Promise<Exercise[]> {
  const res = await getJson<{ items: Exercise[] }>(`/exercises?query=${encodeURIComponent(query)}`);
  return res.items ?? [];
}

export async function createWorkoutLog(payload: {
  dateKey: string; // YYYY-MM-DD
  exerciseId: number;
  minutes: number;
}): Promise<WorkoutLog> {
  return postJson<WorkoutLog>(`/logs/workouts`, {
    loggedAt: `${payload.dateKey}T12:00:00`,
    exerciseId: payload.exerciseId,
    minutes: payload.minutes,
  });
}
