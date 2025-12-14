import { getJson, postJson, delJson } from "./http";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealLog = {
  id: number;
  loggedAt: string;
  mealType: MealType;

  foodId: number;
  foodName: string;
  brand: string | null;

  grams: number;

  calories: number;
  protein: number;
  carb: number;
  fat: number;
};

export async function listMealLogs(dateKey: string) {
  return getJson<{ items: MealLog[] }>(`/logs/meals?date=${dateKey}`);
}

export async function createMealLog(payload: {
  dateKey: string;
  mealType: MealType;
  foodId: number;
  grams: number;
}) {
  return postJson<MealLog>("/logs/meals", payload);
}

export async function deleteMealLog(id: number) {
  return delJson<{ ok: true }>(`/logs/meals/${id}`);
}
