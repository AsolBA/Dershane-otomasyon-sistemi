const ASCII_EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const NON_ASCII_RE = /[^\x00-\x7F]/;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidLoginEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  if (NON_ASCII_RE.test(normalized)) return false;
  return ASCII_EMAIL_RE.test(normalized);
}

export function loginEmailError(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return "E-posta zorunludur.";
  if (NON_ASCII_RE.test(normalized)) {
    return "E-posta adresinde Türkçe veya özel karakter kullanılamaz. Giriş için ASCII karakterler kullanın.";
  }
  if (!ASCII_EMAIL_RE.test(normalized)) return "Geçerli bir e-posta adresi girin.";
  return null;
}
