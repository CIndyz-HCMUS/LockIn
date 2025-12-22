import { getJson } from "./http";

export type Food = {
  id: number;
  name: string;
  brand?: string | null;
  caloriesPer100g: number;
  proteinPer100g?: number;
  carbPer100g?: number;
  fatPer100g?: number;
  servingSizeG?: number;
  servingLabel?: string;
  imagePrimaryUri?: string | null;
  isVerified?: boolean;
  createdAt?: string;
};

export async function searchFoods(query: string) {
  const res = await getJson<{ items: Food[] }>(`/foods?query=${encodeURIComponent(query || "")}`);
  return res?.items ?? [];
}
