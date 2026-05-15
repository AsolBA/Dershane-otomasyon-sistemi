import { config } from "./config.js";
import { createApp } from "./app.js";
import { db } from "./db.js";

const app = createApp();

async function start() {
  await db.query("SELECT 1");
  app.listen(config.port, () => {
    console.log(`Backend running on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error("Startup error:", error);
  process.exit(1);
});
