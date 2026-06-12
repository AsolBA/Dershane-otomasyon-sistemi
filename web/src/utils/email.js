const ASCII_EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const NON_ASCII_RE = /[^\x00-\x7F]/;
const STUDENT_EMAIL_DOMAIN = "dershane.local";

export function turkishToAscii(value) {
  return String(value || "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function buildStudentLoginEmail(firstName, lastName) {
  const local = `${turkishToAscii(firstName)}${turkishToAscii(lastName)}`;
  if (!local) return "";
  return `${local}.student@${STUDENT_EMAIL_DOMAIN}`;
}

export function buildParentLoginEmail(firstName, lastName) {
  const local = `${turkishToAscii(firstName)}${turkishToAscii(lastName)}`;
  if (!local) return "";
  return `${local}.parent@${STUDENT_EMAIL_DOMAIN}`;
}

export function buildTeacherLoginEmail(firstName, lastName) {
  const local = `${turkishToAscii(firstName)}${turkishToAscii(lastName)}`;
  if (!local) return "";
  return `${local}.teacher@${STUDENT_EMAIL_DOMAIN}`;
}

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
