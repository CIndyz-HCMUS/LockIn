import { Router } from "express";
import { handleCreateSleep, handleDeleteSleep, handleListSleep } from "./sleep.controller.js";

export const sleepLogsRouter = Router();
sleepLogsRouter.get("/", handleListSleep);
sleepLogsRouter.post("/", handleCreateSleep);
sleepLogsRouter.delete("/:id", handleDeleteSleep);
