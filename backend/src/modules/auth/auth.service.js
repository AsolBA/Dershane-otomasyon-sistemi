// =============================================================================
// modules/auth/auth.service.js — Giris is mantigi
// Email/sifre kontrolu, JWT uretimi, refresh token DB'ye yazma burada yapilir.
// =============================================================================
import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { comparePassword } from "../../utils/password.js";
import {
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashToken,
  signAccessToken,
} from "../../utils/tokens.js";

function buildAccessPayload(user) {
  return {
    sub: user.id,
    role: user.role_name,
    email: user.email,
  };
}

function mapPublicUser(user) {
  return {
    id: user.id,
    role: user.role_name,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

export async function loginWithEmailPassword(email, password) {
  const result = await query(
    `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email],
  );

  const user = result.rows[0];
  if (!user) {
    throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Email veya sifre hatali.");
  }

  if (!user.is_active) {
    throw new AppError(403, "AUTH_USER_INACTIVE", "Kullanici pasif durumda.");
  }

  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Email veya sifre hatali.");
  }

  const accessToken = signAccessToken(buildAccessPayload(user));
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiresAt();

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshTokenHash, expiresAt],
  );

  await query(
    `UPDATE users
     SET last_login_at = NOW()
     WHERE id = $1`,
    [user.id],
  );

  return {
    user: mapPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshAuthToken(rawRefreshToken) {
  const refreshTokenHash = hashToken(rawRefreshToken);
  const result = await query(
    `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.email, u.first_name, u.last_name, u.is_active, r.name AS role_name
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     JOIN roles r ON r.id = u.role_id
     WHERE rt.token_hash = $1`,
    [refreshTokenHash],
  );

  const tokenRecord = result.rows[0];
  if (!tokenRecord) {
    throw new AppError(401, "AUTH_INVALID_REFRESH_TOKEN", "Refresh token gecersiz.");
  }

  if (tokenRecord.revoked_at) {
    throw new AppError(401, "AUTH_REFRESH_TOKEN_REVOKED", "Refresh token iptal edilmis.");
  }

  if (new Date(tokenRecord.expires_at) <= new Date()) {
    throw new AppError(401, "AUTH_REFRESH_TOKEN_EXPIRED", "Refresh token suresi dolmus.");
  }

  if (!tokenRecord.is_active) {
    throw new AppError(403, "AUTH_USER_INACTIVE", "Kullanici pasif durumda.");
  }

  await query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1`,
    [tokenRecord.id],
  );

  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);
  const expiresAt = getRefreshTokenExpiresAt();

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [tokenRecord.user_id, newRefreshTokenHash, expiresAt],
  );

  const accessToken = signAccessToken({
    sub: tokenRecord.user_id,
    role: tokenRecord.role_name,
    email: tokenRecord.email,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function revokeRefreshToken(rawRefreshToken) {
  const refreshTokenHash = hashToken(rawRefreshToken);
  const result = await query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL
     RETURNING id`,
    [refreshTokenHash],
  );

  if (result.rowCount === 0) {
    throw new AppError(404, "AUTH_REFRESH_TOKEN_NOT_FOUND", "Refresh token bulunamadi.");
  }
}
