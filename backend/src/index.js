import express from "express";
import { config } from "./config.js";
import routes from "./routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { sendSuccess } from "./utils/api-response.js";
import { db } from "./db.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "ok" }, "Backend is running");
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

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
