import { getJson } from "./http";

export type Exercise = {
  id: number;
  title: string;
  category: string;
  caloriesPerMinute: number;
  desc?: string;
};

export type SearchExercisesResponse = {
  items: Exercise[];
  total: number;
  limit: number;
  offset: number;
};

export async function searchExercises(params: {
  q?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return getJson<SearchExercisesResponse>(`/exercises${qs ? `?${qs}` : ""}`);
}
