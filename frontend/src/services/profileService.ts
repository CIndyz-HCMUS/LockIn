import { getJson, putJson } from "./http";

export type Profile = {
  name: string;
  sex: "F" | "M";
  heightCm: number;
  weightKg: number;
  age: number;
  avatarDataUrl?: string;
  activityLevel?: "sedentary" | "light" | "moderate" | "active";
  measurements?: Record<string, number>;
  goal?: { targetWeightKg?: number };
  goals?: {
    calories?: number;
    waterMl?: number;
    steps?: number;
    sleepMinutes?: number;
    relaxMinutes?: number; // ✅ added
    
  };
  updatedAt: string;
};

export async function getProfile(): Promise<Profile> {
  return getJson<Profile>("/profile");
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  return putJson<Profile>("/profile", patch);
}
