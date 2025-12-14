import { Router } from "express";
import { handleGetProfile, handleUpdateProfile } from "./profile.controller.js";


export const profileRouter = Router();

profileRouter.get("/", handleGetProfile);
profileRouter.put("/", handleUpdateProfile);
