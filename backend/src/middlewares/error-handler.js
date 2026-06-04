// =============================================================================
// middlewares/error-handler.js — Merkezi hata yakalama
// Tum modullerdeki AppError ve beklenmeyen hatalar standart JSON formatina cevrilir.
// =============================================================================
import { sendError } from "../utils/api-response.js";

export function notFoundHandler(_req, res) {
  return sendError(res, 404, "ROUTE_NOT_FOUND", null, "Istenen endpoint bulunamadi.");
}

export function errorHandler(error, req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return sendError(res, 400, "INVALID_JSON", null, "Gecersiz JSON govdesi.");
  }

  if (error.type === "entity.parse.failed") {
    return sendError(res, 400, "INVALID_JSON", null, "Gecersiz JSON govdesi.");
  }

  if (error.statusCode && error.code) {
    return sendError(res, error.statusCode, error.code, error.details, error.message);
  }

  console.error("Unhandled error:", {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });

  return sendError(res, 500, "INTERNAL_SERVER_ERROR", null, "Beklenmeyen bir hata olustu.");
}
