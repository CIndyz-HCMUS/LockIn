import { delJson, getJson, postJson } from "./http";

export type WorkoutLog = {
  id: number;
  dateKey: string;        // "YYYY-MM-DD"
  exerciseId: number;
  minutes: number;
  caloriesBurned?: number;
  createdAt?: string;
};

function unwrapArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.items)) return data.items as T[];
  return [];
}

// ✅ List logs theo ngày (Dashboard dùng cái này)
export async function listWorkoutLogs(dateKey: string): Promise<WorkoutLog[]> {
  const sp = new URLSearchParams();

  // backend của bạn có thể dùng "date" hoặc "dateKey"
  sp.set("date", dateKey);

  const data = await getJson<any>(`/logs/workouts?${sp.toString()}`);
  return unwrapArray<WorkoutLog>(data);
}

// ✅ Create log (AddWorkoutModal đang gọi)
export async function createWorkoutLog(payload: {
  dateKey: string;
  exerciseId: number;
  minutes: number;
}): Promise<WorkoutLog> {
  return postJson<WorkoutLog>(`/logs/workouts`, payload);
}

export async function deleteWorkoutLog(id: number): Promise<{ ok: true }> {
  return delJson<{ ok: true }>(`/logs/workouts/${id}`);
}
