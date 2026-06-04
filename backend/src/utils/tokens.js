// =============================================================================
// utils/tokens.js — JWT access token + refresh token uretimi
// Login'de accessToken (kisa omurlu) ve refreshToken (DB'de hash'li saklanir) uretilir.
// =============================================================================
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function getRefreshTokenExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwtRefreshExpiresDays);
  return expiresAt;
}
