import type { Request, Response } from "express";
import {
  createCustomFood,
  deleteCustomFood,
  searchFoods,
  updateCustomFood,
  listCustomFoods,
  type Food,
} from "./foods.repo.js";

function num(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}


export async function handleSearchFoods(req: Request, res: Response) {
  const query = String(req.query.query ?? "");
  const limit = Math.min(100, Math.max(1, num(req.query.limit, 50)));
  const offset = Math.max(0, num(req.query.offset, 0));
  res.json(await searchFoods({ query, limit, offset }));
}

// ✅ GET /foods/custom
export async function handleListCustomFoods(_req: Request, res: Response) {
  res.json({ items: await listCustomFoods() });
}

export async function handleCreateCustomFood(req: Request, res: Response) {
  const body = (req.body ?? {}) as Partial<Food>;

  const name = String(body.name ?? "").trim();
  if (!name) return res.status(400).json({ message: "name is required" });

  const servingSizeG = num(body.servingSizeG, 0);
  if (servingSizeG <= 0) return res.status(400).json({ message: "servingSizeG must be > 0" });

  const created = await createCustomFood({
    name,
    brand: body.brand ? String(body.brand) : null,
    caloriesPer100g: num(body.caloriesPer100g, 0),
    proteinPer100g: num(body.proteinPer100g, 0),
    carbPer100g: num(body.carbPer100g, 0),
    fatPer100g: num(body.fatPer100g, 0),
    servingSizeG,
    servingLabel: String(body.servingLabel ?? "").trim() || `1 serving (${servingSizeG}g)`,
    imagePrimaryUri: body.imagePrimaryUri ? String(body.imagePrimaryUri) : null,
  });

  res.json(created);
}

export async function handleUpdateCustomFood(req: Request, res: Response) {
  const id = Number(req.params.id);
  const patch = req.body ?? {};
  const updated = await updateCustomFood(id, patch);
  if (!updated) return res.status(404).json({ message: "Custom food not found" });
  res.json(updated);
}

export async function handleDeleteCustomFood(req: Request, res: Response) {
  const id = Number(req.params.id);
  const ok = await deleteCustomFood(id);
  if (!ok) return res.status(404).json({ message: "Custom food not found" });
  res.json({ ok: true });
}
