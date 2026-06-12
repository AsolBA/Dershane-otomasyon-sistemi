import { DEFAULT_USER_PASSWORD } from "../constants/default-password.js";

export function validateNewPassword(password) {
  const value = String(password ?? "");
  const errors = [];

  if (value.length < 8) errors.push("Sifre en az 8 karakter olmali.");
  if (!/[a-z]/.test(value)) errors.push("En az bir kucuk harf icermeli.");
  if (!/[A-Z]/.test(value)) errors.push("En az bir buyuk harf icermeli.");
  if (!/[0-9]/.test(value)) errors.push("En az bir rakam icermeli.");
  if (value === DEFAULT_USER_PASSWORD) errors.push("Varsayilan sifre kullanilamaz.");

  return { ok: errors.length === 0, errors };
}
