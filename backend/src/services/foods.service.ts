import { searchFoods, type FoodRecord } from "../repos/foods.repo.js";

export async function getFoods(params?: { query?: string }): Promise<FoodRecord[]> {
  return searchFoods(params?.query);
}
