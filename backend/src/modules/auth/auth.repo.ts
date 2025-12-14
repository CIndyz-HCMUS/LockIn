import path from "path";
import crypto from "crypto";
import { env } from "../../config/env.js";
import { readJsonFile, updateJsonFile } from "../../storage/jsonStore";
import type { SessionRecord, UserPublic, UserRecord } from "./auth.types";

const USERS_FILE = path.join(env.dataDir, "users.json");
const SESSIONS_FILE = path.join(env.dataDir, "sessions.json");

// PBKDF2 (không cần lib ngoài)
function hashPassword(password: string, salt: string) {
  const hash = crypto.pbkdf2Sync(password, salt, 120_000, 32, "sha256").toString("hex");
  return hash;
}

function newToken() {
  return crypto.randomUUID() + crypto.randomBytes(16).toString("hex");
}

export async function ensureSeedDemoUser() {
  // Nếu chưa có user nào, tạo 1 demo user để test luôn.
  await updateJsonFile<UserRecord[]>(USERS_FILE, [], (cur) => {
    if (cur.length > 0) return cur;

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword("demo123", salt);

    const now = new Date().toISOString();
    const demo: UserRecord = {
      id: 1,
      email: "demo@lockin.local",
      name: "Demo User",
      age: 20,
      createdAt: now,
      salt,
      passwordHash,
    };

    return [demo];
  });
}

export async function registerUser(input: { email: string; password: string; name: string; age?: number }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !email.includes("@")) throw new Error("Email invalid");
  if (!input.password || input.password.length < 6) throw new Error("Password must be at least 6 chars");
  if (!name) throw new Error("Name is required");

  let createdUser: UserPublic | null = null;

  await updateJsonFile<UserRecord[]>(USERS_FILE, [], (cur) => {
    if (cur.some((u) => u.email === email)) {
      throw new Error("Email already exists");
    }
    const id = cur.reduce((m, u) => Math.max(m, u.id), 0) + 1;
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(input.password, salt);
    const now = new Date().toISOString();

    const rec: UserRecord = {
      id,
      email,
      name,
      age: input.age,
      createdAt: now,
      salt,
      passwordHash,
    };

    createdUser = { id, email, name, age: input.age, createdAt: now };
    return [rec, ...cur];
  });

  return createdUser!;
}

export async function verifyLogin(email: string, password: string): Promise<UserPublic | null> {
  const e = String(email).trim().toLowerCase();
  const users = await readJsonFile<UserRecord[]>(USERS_FILE, []);
  const u = users.find((x) => x.email === e);
  if (!u) return null;
  const hash = hashPassword(password, u.salt);
  if (hash !== u.passwordHash) return null;

  const { passwordHash, salt, ...pub } = u;
  return pub;
}

export async function createSession(userId: number, remember: boolean) {
  const now = new Date();
  const expires = new Date(now.getTime() + (remember ? 7 : 1) * 24 * 60 * 60 * 1000); // remember: 7d, không: 1d
  const token = newToken();

  const rec: SessionRecord = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  await updateJsonFile<SessionRecord[]>(SESSIONS_FILE, [], (cur) => [rec, ...cur]);
  return rec;
}

export async function getSession(token: string): Promise<SessionRecord | null> {
  const sessions = await readJsonFile<SessionRecord[]>(SESSIONS_FILE, []);
  const s = sessions.find((x) => x.token === token);
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() <= Date.now()) return null;
  return s;
}

export async function deleteSession(token: string) {
  await updateJsonFile<SessionRecord[]>(SESSIONS_FILE, [], (cur) => cur.filter((x) => x.token !== token));
}

export async function getUserById(id: number): Promise<UserPublic | null> {
  const users = await readJsonFile<UserRecord[]>(USERS_FILE, []);
  const u = users.find((x) => x.id === id);
  if (!u) return null;
  const { passwordHash, salt, ...pub } = u;
  return pub;
}
