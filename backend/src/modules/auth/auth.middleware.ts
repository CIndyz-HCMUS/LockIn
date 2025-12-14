import type { Request, Response, NextFunction } from "express";
import { getSession } from "./auth.repo.js";

export type AuthedReq = Request & { auth: { userId: number } };

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = String(req.headers.authorization ?? "");
  if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });

  const token = header.slice("Bearer ".length).trim();
  const s = await getSession(token);
  if (!s) return res.status(401).json({ message: "Invalid or expired token" });

  (req as any).auth = { userId: s.userId };
  next();
}
