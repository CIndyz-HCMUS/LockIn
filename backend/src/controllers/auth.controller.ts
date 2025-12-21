import type { Request, Response } from "express";
import * as svc from "../services/auth.service.js";

function bearerToken(req: Request): string | null {
  const h = String(req.headers.authorization || "");
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function register(req: Request, res: Response) {
  const { email, password, name, age } = req.body || {};
  const user = await svc.register({ email, password, name, age });
  res.json({ user });
}

export async function login(req: Request, res: Response) {
  await svc.ensureDemoUsers();
  const { email, password, remember } = req.body || {};
  const out = await svc.login({ email, password, remember });
  if (!out) return res.status(401).json({ message: "Invalid email or password" });
  res.json(out);
}

export async function me(req: Request, res: Response) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const user = await svc.authFromToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json({ user });
}

export async function logout(req: Request, res: Response) {
  const token = bearerToken(req);
  if (!token) return res.status(204).send();
  await svc.logout(token);
  res.status(204).send();
}
