import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/config -> backend
const BACKEND_DIR = path.resolve(__dirname, "..", "..");
// backend -> project root
const ROOT_DIR = path.resolve(BACKEND_DIR, "..");

export const env = {
  port: Number(process.env.PORT ?? 5179),

  // base seed (read-only)
  rootDataDir: path.join(ROOT_DIR, "electron", "data"),

  // writable custom/logs (read-write)
  backendDataDir: path.join(BACKEND_DIR, "electron", "data"),

  // alias để code cũ dùng env.dataDir vẫn chạy
  dataDir: path.join(BACKEND_DIR, "electron", "data"),
};