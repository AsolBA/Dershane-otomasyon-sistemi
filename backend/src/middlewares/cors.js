// =============================================================================
// middlewares/cors.js — Cross-Origin istekleri (web/mobil -> API)
// React paneli (localhost:5173) farkli porttan API'ye istek atar; CORS buna izin verir.
// OPTIONS (preflight) istekleri burada 204 ile cevaplanir.
// =============================================================================
import { config } from "../config.js";

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && config.corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
}
