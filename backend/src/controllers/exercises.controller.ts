import type { Request, Response } from "express";
import { searchExercises } from "../services/exercises.service.js";

export async function list(req: Request, res: Response) {
  const query = String(req.query.query ?? "");
  const category = String(req.query.category ?? "");
  const items = await searchExercises({ query, category });
  res.json({ items });
}
