import path from "path";

const BACKEND_DIR = process.cwd();
const ROOT_DIR = path.resolve(BACKEND_DIR, "..");

export const env = {
  port: Number(process.env.PORT ?? 5179),

  // base seed
  rootDataDir: path.join(ROOT_DIR, "electron", "data"),

  // writable custom/logs
  backendDataDir: path.join(BACKEND_DIR, "electron", "data"),

  // ✅ alias để code cũ dùng env.dataDir vẫn chạy (trỏ về backendDataDir)
  dataDir: path.join(BACKEND_DIR, "electron", "data"),
};
