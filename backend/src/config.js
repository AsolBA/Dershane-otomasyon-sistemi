// =============================================================================
// config.js — Ortam degiskenleri (env)
// PORT, DATABASE_URL, JWT ayarlari ve CORS izinli origin listesi burada okunur.
// Web (5173) ve Expo (8081) varsayilan olarak CORS'a dahildir.
// =============================================================================
import dotenv from "dotenv";

dotenv.config();

function getEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`${name} tanimli degil.`);
  }
  return value;
}

const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
];

function parseCorsOrigins(value) {
  if (!value || value.trim() === "") {
    return defaultCorsOrigins;
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(getEnv("PORT", "4000")),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtAccessExpiresIn: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  jwtRefreshExpiresDays: Number(getEnv("JWT_REFRESH_EXPIRES_DAYS", "7")),
  bcryptSaltRounds: Number(getEnv("BCRYPT_SALT_ROUNDS", "10")),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
};
