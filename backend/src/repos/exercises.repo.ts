import path from "path";
import { env } from "../config/env.js";
import { readJsonFile } from "./json/jsonStore.js";

export type Exercise = {
  id: number | string;
  title: string;
  category?: string;
  met?: number;
  imageUrl?: string;
};

type Store = { items: Exercise[] } | Exercise[];

function normalizeStore(s: Store): Exercise[] {
  if (Array.isArray(s)) return s;
  return Array.isArray((s as any).items) ? (s as any).items : [];
}

const EXERCISES_FILE = path.join(env.dataDir, "exercises.json");

export async function listExercises(): Promise<Exercise[]> {
  const store = await readJsonFile<Store>(EXERCISES_FILE, [] as any);
  return normalizeStore(store);
}
