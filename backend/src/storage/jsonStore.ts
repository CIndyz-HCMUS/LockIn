import { promises as fs } from "fs";
import path from "path";

const locks = new Map<string, Promise<void>>();

async function withLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(filePath) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  locks.set(filePath, prev.then(() => next));

  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(filePath) === next) locks.delete(filePath);
  }
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (e: any) {
    if (e?.code === "ENOENT") return fallback;
    throw e;
  }
}

export async function writeJsonFileAtomic(filePath: string, data: any): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = filePath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, filePath);
}

export async function updateJsonFile<T>(
  filePath: string,
  fallback: T,
  updater: (current: T) => T | Promise<T>
): Promise<T> {
  return withLock(filePath, async () => {
    const cur = await readJsonFile<T>(filePath, fallback);
    const next = await updater(cur);
    await writeJsonFileAtomic(filePath, next);
    return next;
  });
}
