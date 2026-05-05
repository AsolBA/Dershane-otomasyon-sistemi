import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import {
  loginWithEmailPassword,
  refreshAuthToken,
  revokeRefreshToken,
} from "./auth.service.js";

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
