import type { Request, Response } from "express";
import { appendSleep, deleteSleep, listSleepByDate } from "./sleep.repo.js";

function num(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export async function handleListSleep(req: Request, res: Response) {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Invalid date" });

  res.json({ items: await listSleepByDate(date) });
}

export async function handleCreateSleep(req: Request, res: Response) {
  const { dateKey, minutes } = req.body ?? {};
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return res.status(400).json({ message: "dateKey invalid" });

  const m = num(minutes, 0);
  if (m <= 0) return res.status(400).json({ message: "minutes must be > 0" });

  const log = { id: Date.now(), loggedAt: `${dateKey}T12:00:00`, minutes: Math.round(m) };
  await appendSleep(log);
  res.json(log);
}

export async function handleDeleteSleep(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "id invalid" });

  const ok = await deleteSleep(id);
  if (!ok) return res.status(404).json({ message: "Sleep log not found" });

  res.json({ ok: true });
}
