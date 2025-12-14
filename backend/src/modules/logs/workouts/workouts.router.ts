import { Router } from "express";
import { handleCreateWorkouts, handleListWorkouts } from "./workouts.controller.js";

export const workoutLogsRouter = Router();

workoutLogsRouter.get("/", handleListWorkouts);
workoutLogsRouter.post("/", handleCreateWorkouts);
