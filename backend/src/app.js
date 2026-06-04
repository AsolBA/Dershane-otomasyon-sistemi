// =============================================================================
// app.js — Express uygulama iskeleti
// Middleware zinciri burada kurulur (CORS, log, JSON parse).
// /health = sunucu + DB kontrolu (auth yok). /api/* = tum REST endpointleri.
// =============================================================================
import express from "express";import routes from "./routes.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { healthHandler } from "./modules/health/health.controller.js";

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json());

  app.get("/health", healthHandler);

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
