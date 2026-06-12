// =============================================================================
// modules/auth/auth.controller.js — HTTP katmani (auth)
// Istek govdesini alir, service'i cagirir, sendSuccess ile JSON doner.
// =============================================================================
import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import {
  loginWithEmailPassword,
  refreshAuthToken,
  revokeRefreshToken,
  changePassword as changePasswordService,
} from "./auth.service.js";
import { requestPasswordReset } from "../password-reset/password-reset.service.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, "AUTH_VALIDATION_ERROR", "Email ve sifre zorunludur.");
  }

  const result = await loginWithEmailPassword(email, password);
  return sendSuccess(res, result, "Giris basarili.");
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError(400, "AUTH_VALIDATION_ERROR", "refreshToken zorunludur.");
  }

  const result = await refreshAuthToken(refreshToken);
  return sendSuccess(res, result, "Token yenilendi.");
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError(400, "AUTH_VALIDATION_ERROR", "refreshToken zorunludur.");
  }

  await revokeRefreshToken(refreshToken);
  return sendSuccess(res, { loggedOut: true }, "Cikis basarili.");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    throw new AppError(400, "VALIDATION_ERROR", "currentPassword ve newPassword zorunludur.");
  }
  const result = await changePasswordService(req.user.id, { currentPassword, newPassword });
  return sendSuccess(res, result, "Sifre guncellendi.");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) {
    throw new AppError(400, "VALIDATION_ERROR", "email zorunludur.");
  }
  await requestPasswordReset(email);
  return sendSuccess(
    res,
    { submitted: true },
    "Talebiniz alindi. Yonetici onayindan sonra varsayilan sifre ile giris yapabilirsiniz.",
  );
});
