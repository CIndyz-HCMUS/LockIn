import type { Request, Response } from "express";
import { searchExercises } from "./exercises.repo.js";

function num(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export async function handleSearchExercises(req: Request, res: Response) {
  const query = String(req.query.query ?? "");
  const category = req.query.category ? String(req.query.category) : undefined;

  const limit = Math.min(100, Math.max(1, num(req.query.limit, 50)));
  const offset = Math.max(0, num(req.query.offset, 0));

  res.json(await searchExercises({ query, category, limit, offset }));
}
