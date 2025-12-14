import { Router } from "express";
import { createRelaxationLog, deleteRelaxationLog, listRelaxationLogs } from "./relaxationLogs.repo";

export const relaxationLogsRouter = Router();

relaxationLogsRouter.get("/", async (req, res) => {
  const dateKey = typeof req.query.date === "string" ? req.query.date : "";
  if (!dateKey) return res.status(400).json({ message: "Missing date" });

  res.json(await listRelaxationLogs(dateKey));
});

relaxationLogsRouter.post("/", async (req, res) => {
  const body = req.body ?? {};
  const { dateKey, activityId, activityTitle, minutes, moodBefore, moodAfter, note } = body;

  if (!dateKey || !activityTitle || !Number.isFinite(Number(activityId)) || !Number.isFinite(Number(minutes))) {
    return res.status(400).json({ message: "Invalid body" });
  }

  const created = await createRelaxationLog({
    dateKey: String(dateKey),
    activityId: Number(activityId),
    activityTitle: String(activityTitle),
    minutes: Number(minutes),
    moodBefore: moodBefore ? String(moodBefore) : undefined,
    moodAfter: moodAfter ? String(moodAfter) : undefined,
    note: note ? String(note) : undefined,
  });

  res.json(created);
});

relaxationLogsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const ok = await deleteRelaxationLog(id);
  if (!ok) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});
