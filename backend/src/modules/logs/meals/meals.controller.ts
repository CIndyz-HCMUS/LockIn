import type { Request, Response } from "express";
import { getFoodById } from "../../foods/foods.repo.js";
import { appendMeal, deleteMeal, listMealsByDate, type MealLog, type MealType } from "./meals.repo.js";

function num(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export async function handleListMeals(req: Request, res: Response) {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Invalid date" });

  res.json({ items: await listMealsByDate(date) });
}

export async function handleCreateMeal(req: Request, res: Response) {
  const { dateKey, foodId, grams, mealType } = req.body ?? {};

  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return res.status(400).json({ message: "dateKey invalid" });
  }

  const mt = String(mealType ?? "breakfast") as MealType;
  if (!MEAL_TYPES.includes(mt)) return res.status(400).json({ message: "mealType invalid" });

  const fid = Number(foodId);
  if (!Number.isFinite(fid)) return res.status(400).json({ message: "foodId invalid" });

  const g = num(grams, 0);
  if (g <= 0) return res.status(400).json({ message: "grams must be > 0" });

  const food = await getFoodById(fid);
  if (!food) return res.status(400).json({ message: "Food not found" });

  // tính macro theo per100g
  const factor = g / 100;
  const calories = Math.round((food.caloriesPer100g ?? 0) * factor);
  const protein = Math.round(((food.proteinPer100g ?? 0) * factor) * 10) / 10;
  const carb = Math.round(((food.carbPer100g ?? 0) * factor) * 10) / 10;
  const fat = Math.round(((food.fatPer100g ?? 0) * factor) * 10) / 10;

  const log: MealLog = {
    id: Date.now(),
    loggedAt: `${dateKey}T12:00:00`, // demo
    mealType: mt,

    foodId: food.id,
    foodName: food.name,
    brand: food.brand ?? null,

    grams: Math.round(g),

    calories,
    protein,
    carb,
    fat,
  };

  await appendMeal(log);
  res.json(log);
}

export async function handleDeleteMeal(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "id invalid" });

  const ok = await deleteMeal(id);
  if (!ok) return res.status(404).json({ message: "Meal log not found" });
  res.json({ ok: true });
}
