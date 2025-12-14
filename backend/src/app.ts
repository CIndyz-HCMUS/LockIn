import express from "express";
import cors from "cors";

import { authRouter } from "./modules/auth/auth.router.js";
import { requireAuth } from "./modules/auth/auth.middleware.js";
import { ensureSeedDemoUser } from "./modules/auth/auth.repo.js";
import { relaxationsRouter } from "./modules/relaxations/relaxations.router";
import { relaxationLogsRouter } from "./modules/relaxations/relaxationLogs.router.js";


import { foodsRouter } from "./modules/foods/foods.router.js";
import { exercisesRouter } from "./modules/exercises/exercises.router.js";
import { statsRouter } from "./modules/stats/stats.router.js";
import { profileRouter } from "./modules/profile/profile.router.js";

import { mealLogsRouter } from "./modules/logs/meals/meals.router.js";
import { workoutLogsRouter } from "./modules/logs/workouts/workouts.router.js";
import { waterLogsRouter } from "./modules/logs/water/water.router.js";
import { stepsLogsRouter } from "./modules/logs/steps/steps.router.js";
import { sleepLogsRouter } from "./modules/logs/sleep/sleep.router.js";

export function createApp() {
  const app = express();
  void ensureSeedDemoUser();


  // Allow FE dev server to call BE
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Catalog
  app.use("/auth", authRouter);

  app.use("/profile", profileRouter);
  app.use("/foods", foodsRouter);
  app.use("/exercises", exercisesRouter);
  app.use("/relaxations", relaxationsRouter);
  app.use("/logs/relaxations", relaxationLogsRouter);
  // Dashboard stats
  app.use("/stats", statsRouter);

  // Logs
  app.use("/logs/meals", mealLogsRouter);
  app.use("/logs/workouts", workoutLogsRouter);
  app.use("/logs/water", waterLogsRouter);
  app.use("/logs/steps", stepsLogsRouter);
  app.use("/logs/sleep", sleepLogsRouter);

  // 404
  app.use((_req, res) => res.status(404).json({ message: "Not found" }));

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
