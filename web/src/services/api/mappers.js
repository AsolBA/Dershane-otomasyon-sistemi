export function unwrapList(data) {
  return data?.items ?? data?.rows ?? (Array.isArray(data) ? data : []);
}

export function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function joinFullName(firstName, lastName) {
  return [firstName, lastName].filter((p) => p && p !== "-").join(" ").trim();
}

export function formatTime(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function formatDateOnly(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  const isoDate = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  if (isoDate) return isoDate[1];
  return s;
}

export function normalizeTimeForApi(value) {
  const v = String(value || "").trim();
  if (!v) return v;
  const withMinutes = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (withMinutes) {
    return `${String(Number(withMinutes[1])).padStart(2, "0")}:${withMinutes[2]}`;
  }
  const hourOnly = /^(\d{1,2})$/.exec(v);
  if (hourOnly) {
    return `${String(Number(hourOnly[1])).padStart(2, "0")}:00`;
  }
  return v;
}

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function dayNameToNumber(day) {
  const idx = DAY_NAMES.indexOf(String(day));
  if (idx >= 0) return idx + 1;
  const n = Number(day);
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : 1;
}

export function dayNumberToName(value) {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 7) return DAY_NAMES[n - 1];
  return String(value ?? "");
}

export function buildClassMaps(classes) {
  const idToName = new Map();
  const nameToId = new Map();
  for (const c of classes) {
    const id = Number(c.id ?? c.class_id);
    const name = c.name ?? c.class_name ?? "";
    if (!Number.isFinite(id) || !name) continue;
    idToName.set(id, name);
    nameToId.set(name.trim().toLowerCase(), id);
  }
  return { idToName, nameToId };
}

export function resolveClassId(className, classes) {
  const normalized = String(className || "").trim().toLowerCase();
  if (!normalized) return null;
  const match = classes.find((c) => String(c.name ?? c.class_name ?? "").trim().toLowerCase() === normalized);
  const id = match?.id ?? match?.class_id;
  return id != null ? Number(id) : null;
}
