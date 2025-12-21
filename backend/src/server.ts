// backend/src/server.ts
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = await createApp();
const port = Number(env.port ?? 5179);

app.listen(port, () => {
  console.log(`[backend] listening on http://127.0.0.1:${port}`);
  console.log(`[backend] dataDir: ${env.dataDir}`);
});
