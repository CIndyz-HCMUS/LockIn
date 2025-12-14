import { Router } from "express";
import { handleCreateMeal, handleDeleteMeal, handleListMeals } from "./meals.controller.js";

export const mealLogsRouter = Router();

mealLogsRouter.get("/", handleListMeals);
mealLogsRouter.post("/", handleCreateMeal);
mealLogsRouter.delete("/:id", handleDeleteMeal);
