import type { Request, Response } from "express";
import { appendSteps, deleteSteps, listStepsByDate } from "./steps.repo.js";

function num(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export async function handleListSteps(req: Request, res: Response) {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Invalid date" });

  res.json({ items: await listStepsByDate(date) });
}

export async function handleCreateSteps(req: Request, res: Response) {
  const { dateKey, steps } = req.body ?? {};
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return res.status(400).json({ message: "dateKey invalid" });

  const s = num(steps, 0);
  if (s <= 0) return res.status(400).json({ message: "steps must be > 0" });

  const log = { id: Date.now(), loggedAt: `${dateKey}T12:00:00`, steps: Math.round(s) };
  await appendSteps(log);
  res.json(log);
}

export async function handleDeleteSteps(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "id invalid" });

  const ok = await deleteSteps(id);
  if (!ok) return res.status(404).json({ message: "Steps log not found" });

  res.json({ ok: true });
}
