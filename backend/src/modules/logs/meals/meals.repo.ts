import path from "path";
import { env } from "../../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../../storage/jsonStore.js";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealLog = {
  id: number;
  loggedAt: string; // ISO
  mealType: MealType;

  // snapshot (để food bị xoá vẫn giữ lịch sử)
  foodId: number;
  foodName: string;
  brand: string | null;

  grams: number;

  calories: number;
  protein: number;
  carb: number;
  fat: number;
};

const FILE = path.join(env.dataDir, "mealLogs.json");

export async function listMealsByDate(dateKey: string): Promise<MealLog[]> {
  const all = await readJsonFile<MealLog[]>(FILE, []);
  return all.filter((x) => String(x.loggedAt).startsWith(dateKey));
}

export async function appendMeal(log: MealLog) {
  await updateJsonFile<MealLog[]>(FILE, [], (cur) => [log, ...cur]);
}

export async function deleteMeal(id: number): Promise<boolean> {
  let removed = false;
  await updateJsonFile<MealLog[]>(FILE, [], (cur) => {
    const before = cur.length;
    const next = cur.filter((x) => x.id !== id);
    removed = next.length !== before;
    return next;
  });
  return removed;
}
