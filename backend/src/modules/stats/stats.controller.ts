import type { Request, Response } from "express";
import { getDashboardToday } from "./stats.repo.js";

export async function handleGetToday(req: Request, res: Response) {
  const dateKey = String(req.query.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD" });
  }

  const dto = await getDashboardToday(dateKey);
  res.json(dto);
}
