import dotenv from "dotenv";

dotenv.config();

function getEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`${name} tanimli degil.`);
  }
  return value;
}

export const config = {
  port: Number(getEnv("PORT", "4000")),
  databaseUrl: getEnv("DATABASE_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtAccessExpiresIn: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  jwtRefreshExpiresDays: Number(getEnv("JWT_REFRESH_EXPIRES_DAYS", "7")),
  bcryptSaltRounds: Number(getEnv("BCRYPT_SALT_ROUNDS", "10")),
};
