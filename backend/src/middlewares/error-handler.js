import { sendError } from "../utils/api-response.js";

export function notFoundHandler(_req, res) {
  return sendError(res, 404, "ROUTE_NOT_FOUND", "Istenen endpoint bulunamadi.");
}

export function errorHandler(error, _req, res, _next) {
  if (error.statusCode && error.code) {
    return sendError(res, error.statusCode, error.code, error.details, error.message);
  }

  console.error("Unhandled error:", error);
  return sendError(res, 500, "INTERNAL_SERVER_ERROR", "Beklenmeyen bir hata olustu.");
}
