import { Router } from "express";
import { handleGetToday } from "./stats.controller.js";

export const statsRouter = Router();
statsRouter.get("/today", handleGetToday);
