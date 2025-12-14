import type { Request, Response } from "express";
import { createSession, deleteSession, getUserById, registerUser, verifyLogin } from "./auth.repo.js";

export async function handleRegister(req: Request, res: Response) {
  try {
    const { email, password, name, age } = req.body ?? {};
    const user = await registerUser({ email, password, name, age: age ? Number(age) : undefined });
    const session = await createSession(user.id, true); // mặc định signup “remember” cho tiện demo
    res.json({ token: session.token, user });
  } catch (e: any) {
    res.status(400).json({ message: e?.message || "Register failed" });
  }
}

export async function handleLogin(req: Request, res: Response) {
  const { email, password, remember } = req.body ?? {};
  const user = await verifyLogin(String(email ?? ""), String(password ?? ""));
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const session = await createSession(user.id, Boolean(remember));
  res.json({ token: session.token, user });
}

export async function handleMe(req: Request, res: Response) {
  const userId = (req as any).auth?.userId;
  const user = await getUserById(Number(userId));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
}

export async function handleLogout(req: Request, res: Response) {
  const header = String(req.headers.authorization ?? "");
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  if (token) await deleteSession(token);
  res.json({ ok: true });
}
