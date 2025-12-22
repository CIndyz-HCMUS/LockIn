import type { Request, Response } from "express";
import { getFoods } from "../services/foods.service.js";

export async function list(req: Request, res: Response) {
  const query = typeof req.query.query === "string" ? req.query.query : "";
  const items = await getFoods({ query });
  res.json({ items });
}
