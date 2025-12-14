import type { Request, Response } from "express";
import { appendWater, deleteWater, listWaterByDate } from "./water.repo.js";

function num(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export async function handleListWater(req: Request, res: Response) {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Invalid date" });

  res.json({ items: await listWaterByDate(date) });
}

export async function handleCreateWater(req: Request, res: Response) {
  const { dateKey, ml } = req.body ?? {};
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return res.status(400).json({ message: "dateKey invalid" });

  const m = num(ml, 0);
  if (m <= 0) return res.status(400).json({ message: "ml must be > 0" });

  const log = { id: Date.now(), loggedAt: `${dateKey}T12:00:00`, ml: Math.round(m) };
  await appendWater(log);
  res.json(log);
}

export async function handleDeleteWater(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "id invalid" });

  const ok = await deleteWater(id);
  if (!ok) return res.status(404).json({ message: "Water log not found" });

  res.json({ ok: true });
}
