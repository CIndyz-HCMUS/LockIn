import { Router } from "express";
import { handleCreateWater, handleDeleteWater, handleListWater } from "./water.controller.js";

export const waterLogsRouter = Router();
waterLogsRouter.get("/", handleListWater);
waterLogsRouter.post("/", handleCreateWater);
waterLogsRouter.delete("/:id", handleDeleteWater);
