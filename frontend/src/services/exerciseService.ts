import { delJson, getJson, patchJson, postJson } from "./http";

export type Exercise = {
  id: number | string;
  title: string;
  category?: string;
  met?: number;
  caloriesPerMinute?: number;
  desc?: string;
  isVerified?: boolean;

  isCustom?: boolean;
  createdAt?: string;

  imageUrl?: string;      // "/assets/exercises/xxx.png"
  isFavorite?: boolean;
};

export async function searchExercises(params?: { query?: string; category?: string }) {
  const q = encodeURIComponent(params?.query ?? "");
  const c = encodeURIComponent(params?.category ?? "");
  return getJson<{ items: Exercise[] }>(`/exercises?query=${q}&category=${c}`);
}

export async function listFavoriteExercises() {
  return getJson<{ items: Exercise[] }>(`/exercises/favorites`);
}

export async function toggleExerciseFavorite(id: number | string) {
  return patchJson<{ id: number | string; isFavorite: boolean }>(`/exercises/${id}/favorite`, {});
}

export async function createCustomExercise(input: {
  title: string;
  category?: string;
  met?: number;
  caloriesPerMinute?: number;
  imageUrl?: string;
  desc?: string;
}) {
  return postJson<{ item: Exercise }>(`/exercises/custom`, input);
}

export async function deleteCustomExercise(id: number | string) {
  return delJson(`/exercises/custom/${id}`);
}
