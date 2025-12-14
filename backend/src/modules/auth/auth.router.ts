import { Router } from "express";
import { handleLogin, handleLogout, handleMe, handleRegister } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", handleRegister);
authRouter.post("/login", handleLogin);
authRouter.get("/me", requireAuth, handleMe);
authRouter.post("/logout", requireAuth, handleLogout);
