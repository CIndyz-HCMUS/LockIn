import path from "path";
import { env } from "../../config/env.js";
import { readJsonFile, writeJsonFileAtomic } from "../../storage/jsonStore.js";
import type { Profile } from "./profile.types.js";

const PROFILE_PATH = path.join(env.dataDir, "profile.json");

const defaultGoals = {
  calories: 2000,
  waterMl: 2000,
  steps: 8000,
  sleepMinutes: 450,
  relaxMinutes: 10,
};

function num(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function withDefaults(p: any): Profile {
  return {
    name: p?.name ?? "Demo User",
    sex: p?.sex === "M" ? "M" : "F",
    heightCm: num(p?.heightCm, 170),
    weightKg: num(p?.weightKg, 60),
    age: num(p?.age, 20),
    activityLevel: p?.activityLevel ?? "moderate",

    measurements: p?.measurements ?? {},
    goal: p?.goal ?? {},

    // ✅ merge default goals để không bị thiếu field (relaxMinutes)
    goals: { ...defaultGoals, ...(p?.goals ?? {}) },

    // ✅ avatar (base64 data url)
    avatarDataUrl: typeof p?.avatarDataUrl === "string" ? p.avatarDataUrl : undefined,

    updatedAt: p?.updatedAt ?? new Date().toISOString(),
  } as Profile;
}

export async function getProfile(): Promise<Profile> {
  const raw = await readJsonFile<any>(PROFILE_PATH, {});
  return withDefaults(raw);
}

export async function saveProfile(partial: Partial<Profile>): Promise<Profile> {
  const cur = await getProfile();

  const next: Profile = withDefaults({
    ...cur,
    ...partial,
    measurements: { ...(cur.measurements ?? {}), ...(partial.measurements ?? {}) },
    goal: { ...(cur.goal ?? {}), ...(partial.goal ?? {}) },
    goals: { ...(cur.goals ?? {}), ...(partial.goals ?? {}) },
    updatedAt: new Date().toISOString(),
  });

  await writeJsonFileAtomic(PROFILE_PATH, next);
  return next;
}
