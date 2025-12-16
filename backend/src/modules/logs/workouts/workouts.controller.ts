import { Request, Response } from "express";
import path from "path";
import { env } from "../../../config/env.js";
import { readJsonFile } from "../../../storage/jsonStore.js";
import { appendWorkout, listWorkoutsByDate, WorkoutLog } from "./workouts.repo.js";

type Exercise = { id: number; title: string; category: string; met?: number };
type Profile = { weightKg?: number };

const EXERCISES_PATH = path.join(env.rootDataDir, "exercises.json");
const PROFILE_PATH = path.join(env.dataDir, "profile.json");


function calcCaloriesBurned(met: number | undefined, weightKg: number, minutes: number) {
  // kcal = MET * 3.5 * weight(kg) / 200 * minutes
  const m = met ?? 4; // fallback demo
  return Math.round((m * 3.5 * weightKg * minutes) / 200);
}

export async function handleListWorkouts(req: Request, res: Response) {
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Invalid date" });
  const items = await listWorkoutsByDate(date);
  res.json({ items });
}

export async function handleCreateWorkouts(req: Request, res: Response) {
  const { loggedAt, exerciseId, minutes } = req.body ?? {};
  if (typeof loggedAt !== "string" || !loggedAt.includes("T")) return res.status(400).json({ message: "loggedAt required" });
  if (!Number.isFinite(exerciseId)) return res.status(400).json({ message: "exerciseId required" });
  if (!Number.isFinite(minutes) || minutes <= 0) return res.status(400).json({ message: "minutes invalid" });

  const exercises = await readJsonFile<Exercise[]>(EXERCISES_PATH, []);
  const ex = exercises.find((x) => x.id === Number(exerciseId));
  if (!ex) return res.status(404).json({ message: "Exercise not found" });

  const profile = await readJsonFile<Profile>(PROFILE_PATH, {});
  const weightKg = Number(profile.weightKg ?? 60);

  const log: WorkoutLog = {
    id: Date.now(),
    loggedAt,
    exerciseId: ex.id,
    titleSnapshot: ex.title,
    categorySnapshot: ex.category || "Other",
    minutes: Number(minutes),
    caloriesBurned: calcCaloriesBurned(ex.met, weightKg, Number(minutes)),
  };

  await appendWorkout(log);
  res.json(log);
}
