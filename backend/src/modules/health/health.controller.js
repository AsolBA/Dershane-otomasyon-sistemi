import { db } from "../../db.js";
import { sendError, sendSuccess } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const healthHandler = asyncHandler(async (_req, res) => {
  try {
    await db.query("SELECT 1");
    return sendSuccess(res, {
      status: "ok",
      db: "connected",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return sendError(
      res,
      503,
      "DB_UNAVAILABLE",
      null,
      "Veritabani baglantisi kurulamadi.",
    );
  }
});
