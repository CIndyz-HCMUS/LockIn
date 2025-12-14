import { getJson, postJson, delJson} from "./http";


export type Food = {
  id: number;
  name: string;
  brand: string | null;

  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;

  servingSizeG: number;
  servingLabel: string;
  imagePrimaryUri?: string | null;

  isVerified?: boolean;
};


export async function listCustomFoods() {
  return getJson<{ items: Food[] }>("/foods/custom");
}

export async function deleteCustomFood(id: number) {
  return delJson<{ ok: true }>(`/foods/custom/${id}`);
}

export async function searchFoods(query: string, limit = 50, offset = 0) {
  return getJson<{ items: Food[]; total: number }>(
    `/foods?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`
  );
}

// ✅ tạo custom food sang /foods/custom
export async function createFood(payload: Omit<Food, "id">) {
  return postJson<Food>("/foods/custom", payload);
}
