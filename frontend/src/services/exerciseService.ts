import { getJson, postJson, delJson } from "./http";

export type Exercise = {
  id: number;
  title: string;
  category: string;
  met: number;
  isCustom?: boolean;
  createdAt?: string;
};

export type SearchExercisesResponse = {
  items: Exercise[];
  total: number;
  limit: number;
  offset: number;
};

export async function searchExercises(params: {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<SearchExercisesResponse> {
  const sp = new URLSearchParams();
  sp.set("query", params.query ?? "");
  if (params.category) sp.set("category", params.category);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));

  return getJson<SearchExercisesResponse>(`/exercises?${sp.toString()}`);
}

export async function createExercise(payload: {
  title: string;
  category: string;
  met: number;
}): Promise<Exercise> {
  return postJson<Exercise>("/exercises", payload);
}

export async function deleteExercise(id: number): Promise<{ ok: true }> {
  return delJson<{ ok: true }>(`/exercises/${id}`);
}
