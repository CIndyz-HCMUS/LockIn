import { Router } from "express";
import { createWorkoutLog, deleteWorkoutLog, listWorkoutLogs } from "./workoutLogs.repo";

export const workoutLogsRouter = Router();

workoutLogsRouter.get("/", async (req, res) => {
  const dateKey = typeof req.query.date === "string" ? req.query.date : "";
  if (!dateKey) return res.status(400).json({ message: "Missing date" });
  res.json(await listWorkoutLogs(dateKey));
});

workoutLogsRouter.post("/", async (req, res) => {
  const body = req.body ?? {};
  const dateKey = String(body.dateKey ?? "");
  const minutes = Number(body.minutes);

  if (!dateKey) return res.status(400).json({ message: "dateKey required" });
  if (!Number.isFinite(minutes) || minutes <= 0) return res.status(400).json({ message: "minutes invalid" });

  try {
    const created = await createWorkoutLog({
      dateKey,
      minutes,
      exerciseId: body.exerciseId != null ? Number(body.exerciseId) : undefined,
      exerciseName: body.exerciseName ? String(body.exerciseName) : undefined,
      category: body.category ? String(body.category) : undefined,
      caloriesBurned: body.caloriesBurned != null ? Number(body.caloriesBurned) : undefined,
    });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Create failed" });
  }
});

workoutLogsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const ok = await deleteWorkoutLog(id);
  if (!ok) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});
