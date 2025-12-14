import { Router } from "express";
import { handleSearchExercises } from "./exercises.controller.js";

export const exercisesRouter = Router();
exercisesRouter.get("/", handleSearchExercises);
