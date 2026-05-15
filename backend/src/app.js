import express from "express";
import routes from "./routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { healthHandler } from "./modules/health/health.controller.js";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.get("/health", healthHandler);

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
