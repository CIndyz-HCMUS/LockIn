import { Router } from "express";
import { handleCreateSteps, handleDeleteSteps, handleListSteps } from "./steps.controller.js";

export const stepsLogsRouter = Router();
stepsLogsRouter.get("/", handleListSteps);
stepsLogsRouter.post("/", handleCreateSteps);
stepsLogsRouter.delete("/:id", handleDeleteSteps);
