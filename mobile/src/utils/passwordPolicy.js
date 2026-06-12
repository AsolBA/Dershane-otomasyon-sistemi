export const DEFAULT_USER_PASSWORD = "ChangeMe123!";

export function validateNewPassword(password) {
  const value = String(password ?? "");
  const errors = [];

  if (value.length < 8) errors.push("Şifre en az 8 karakter olmalı.");
  if (!/[a-z]/.test(value)) errors.push("En az bir küçük harf içermeli.");
  if (!/[A-Z]/.test(value)) errors.push("En az bir büyük harf içermeli.");
  if (!/[0-9]/.test(value)) errors.push("En az bir rakam içermeli.");
  if (value === DEFAULT_USER_PASSWORD) errors.push("Varsayılan şifre kullanılamaz.");

  return { ok: errors.length === 0, errors };
}
