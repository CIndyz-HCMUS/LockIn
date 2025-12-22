import path from "node:path";
import { env } from "../config/env.js";
import { readJsonFile } from "./json/jsonStore.js";

export type FoodRecord = {
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

const FOODS_FILE = path.join(env.dataDir, "foods.json");
const FOODS_CUSTOM_FILE = path.join(env.dataDir, "foods.custom.json");

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

export async function listFoods(): Promise<FoodRecord[]> {
  const base = await readJsonFile<FoodRecord[]>(FOODS_FILE, []);
  const custom = await readJsonFile<FoodRecord[]>(FOODS_CUSTOM_FILE, []);
  // simple concat, sort verified first then name
  const all = [...base, ...custom];
  all.sort((a, b) => {
    const av = a.isVerified ? 0 : 1;
    const bv = b.isVerified ? 0 : 1;
    if (av !== bv) return av - bv;
    return norm(a.name).localeCompare(norm(b.name));
  });
  return all;
}

export async function searchFoods(query?: string): Promise<FoodRecord[]> {
  const q = norm(query);
  const all = await listFoods();
  if (!q) return all;

  return all.filter((f) => {
    const name = norm(f.name);
    const brand = norm(f.brand);
    return name.includes(q) || brand.includes(q);
  });
}
