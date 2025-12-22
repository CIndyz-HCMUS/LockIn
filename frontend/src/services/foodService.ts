import { delJson, getJson, postJson } from "./http";

export type Food = {
  id: number;
  name: string;
  brand?: string | null;
  caloriesPer100g: number;
  servingSizeG?: number;
  servingLabel?: string;
  imagePrimaryUri?: string | null; // "/assets/foods/xxx.png"
  isVerified?: boolean;
  createdAt?: string;
};

export function apiBase() {
  return (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:5179";
}

export async function searchFoods(query: string) {
  const res = await getJson<{ items: Food[] }>(`/foods?query=${encodeURIComponent(query || "")}`);
  return res?.items ?? [];
}

export async function getFavoriteIds() {
  const res = await getJson<{ ids: number[] }>(`/foods/favorites`);
  return res?.ids ?? [];
}

export async function addFavorite(foodId: number) {
  const res = await postJson<{ ids: number[] }>(`/foods/favorites`, { foodId });
  return res?.ids ?? [];
}

export async function removeFavorite(foodId: number) {
  const res = await delJson<{ ids: number[] }>(`/foods/favorites/${foodId}`);
  return res?.ids ?? [];
}

export async function createCustomFood(payload: {
  name: string;
  brand?: string;
  caloriesPer100g: number;
  servingSizeG?: number;
  servingLabel?: string;
  imageBase64?: string; // data url
}) {
  const res = await postJson<{ item: Food }>(`/foods/custom`, payload);
  return res?.item;
}
