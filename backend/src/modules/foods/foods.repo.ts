import path from "path";
import { env } from "../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../storage/jsonStore.js";

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

  isVerified: boolean; // base foods: true, custom: false
  createdAt: string;
};


// ✅ list custom foods (để frontend có "My custom foods")
export async function listCustomFoods(): Promise<Food[]> {
  return readCustomFoods();
}


// ✅ 2 file tách biệt
const BASE_FILE = path.join(env.rootDataDir, "foods.json");
const CUSTOM_FILE = path.join(env.backendDataDir, "foods.custom.json");

// ---------------- base/custom reads ----------------
export async function readBaseFoods(): Promise<Food[]> {
  return readJsonFile<Food[]>(BASE_FILE, []);
}

export async function readCustomFoods(): Promise<Food[]> {
  return readJsonFile<Food[]>(CUSTOM_FILE, []);
}

// ✅ merge: custom + base (custom show first)
export async function readAllFoodsMerged(): Promise<Food[]> {
  const [custom, base] = await Promise.all([readCustomFoods(), readBaseFoods()]);
  return [...custom, ...base];
}

export async function getFoodById(id: number): Promise<Food | null> {
  const all = await readAllFoodsMerged();
  return all.find((f) => f.id === id) ?? null;
}

export async function searchFoods(params: {
  query: string;
  limit: number;
  offset: number;
}): Promise<{ items: Food[]; total: number }> {
  const { query, limit, offset } = params;
  const all = await readAllFoodsMerged();

  const q = query.trim().toLowerCase();
  let filtered = all;

  if (q.length > 0) {
    filtered = all.filter((f) => {
      const name = (f.name ?? "").toLowerCase();
      const brand = (f.brand ?? "").toLowerCase();
      return name.includes(q) || brand.includes(q);
    });
  }

  // ✅ verified trước (base foods)
  filtered.sort((a, b) => Number(b.isVerified) - Number(a.isVerified));

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);
  return { items, total };
}

// ---------------- custom CRUD ----------------

// ✅ tạo food custom => id âm để không đụng base
export async function createCustomFood(input: Omit<Food, "id" | "createdAt" | "isVerified">): Promise<Food> {
  const now = new Date().toISOString();
  const food: Food = {
    ...input,
    id: -Date.now(),
    createdAt: now,
    isVerified: false,
  };

  await updateJsonFile<Food[]>(CUSTOM_FILE, [], (cur) => [food, ...cur]);
  return food;
}

export async function updateCustomFood(id: number, patch: Partial<Omit<Food, "id" | "createdAt">>): Promise<Food | null> {
  if (id >= 0) return null; // chỉ cho sửa custom (id âm)

  let updated: Food | null = null;
  await updateJsonFile<Food[]>(CUSTOM_FILE, [], (cur) => {
    const idx = cur.findIndex((x) => x.id === id);
    if (idx < 0) return cur;

    const next: Food = { ...cur[idx], ...patch, id: cur[idx].id, createdAt: cur[idx].createdAt, isVerified: false };
    const copy = [...cur];
    copy[idx] = next;
    updated = next;
    return copy;
  });

  return updated;
}

export async function deleteCustomFood(id: number): Promise<boolean> {
  if (id >= 0) return false;

  let removed = false;
  await updateJsonFile<Food[]>(CUSTOM_FILE, [], (cur) => {
    const before = cur.length;
    const next = cur.filter((x) => x.id !== id);
    removed = next.length !== before;
    return next;
  });

  return removed;
}
