import { query } from "../db.js";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError(401, "AUTH_UNAUTHORIZED", "Gecersiz veya eksik access token.");
    }

    const token = authorization.split(" ")[1];
    const payload = verifyAccessToken(token);

    const userResult = await query(
      `SELECT u.id, u.role_id, u.email, u.first_name, u.last_name, u.is_active, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [payload.sub],
    );

    const user = userResult.rows[0];
    if (!user || !user.is_active) {
      throw new AppError(401, "AUTH_UNAUTHORIZED", "Kullanici aktif degil veya bulunamadi.");
    }

    req.user = {
      id: user.id,
      roleId: user.role_id,
      role: user.role_name,
      email: user.email,
      fullName: `${user.first_name} ${user.last_name}`.trim(),
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError(401, "AUTH_TOKEN_EXPIRED", "Access token suresi doldu."));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError(401, "AUTH_INVALID_TOKEN", "Access token gecersiz."));
    }

    next(error);
  }
}

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, "AUTH_UNAUTHORIZED", "Kimlik dogrulamasi gerekli."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "AUTH_FORBIDDEN", "Bu islem icin yetkiniz yok."));
    }

    next();
  };
}
