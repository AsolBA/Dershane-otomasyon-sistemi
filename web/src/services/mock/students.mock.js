import { createId, getStore } from "./state.js";
import * as classesMock from "./classes.mock.js";
import { buildStudentLoginEmail, normalizeEmail } from "../../utils/email.js";

function resolveStudentEmail(payload) {
  return normalizeEmail(payload.email || buildStudentLoginEmail(payload.firstName, payload.lastName));
}

export async function collectExistingStudentEmails() {
  const emails = new Set();
  for (const row of getStore().students) {
    const email = normalizeEmail(row.email);
    if (email) emails.add(email);
  }
  return emails;
}

export async function getById(id) {
  const row = getStore().students.find((r) => r.id === id);
  if (!row) throw new Error("Öğrenci bulunamadı.");
  return row;
}

export async function list({ onlyActive, q, classId, limit } = {}) {
  let rows = [...getStore().students];
  if (onlyActive) rows = rows.filter((r) => r.active);
  if (classId != null && classId !== "") {
    const classRows = await classesMock.list({});
    const match = classRows.find((c) => String(c.id) === String(classId));
    if (match?.name) {
      rows = rows.filter((r) => String(r.className || "").toLowerCase() === String(match.name).toLowerCase());
    }
  }
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => {
      const haystack = `${r.fullName} ${r.email} ${r.className} ${r.parentName} ${r.parentPhone}`.toLowerCase();
      return haystack.includes(query);
    });
  }
  if (limit != null) rows = rows.slice(0, Number(limit));
  return rows.sort((a, b) => {
    const byClass = (a.className || "").localeCompare(b.className || "", "tr");
    if (byClass !== 0) return byClass;
    return (a.fullName || "").localeCompare(b.fullName || "", "tr");
  });
}

export async function create(payload) {
  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim();
  const email = resolveStudentEmail(payload);
  if (!email) throw new Error("Geçerli ad ve soyad girin.");
  const duplicate = getStore().students.some((row) => normalizeEmail(row.email) === email);
  if (duplicate) throw new Error("Bu öğrenci e-postası zaten kayıtlı.");

  const row = {
    id: createId("stu"),
    fullName,
    email,
    className: payload.className,
    parentName: payload.parentName ?? "",
    parentPhone: payload.parentPhone ?? "",
    parentEmail: payload.parentEmail ?? "",
    active: payload.active !== false,
    ...payload
  };
  getStore().students.unshift(row);
  return row;
}

export async function update(id, payload) {
  const store = getStore();
  const idx = store.students.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Öğrenci bulunamadı.");
  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim();
  store.students[idx] = {
    ...store.students[idx],
    ...payload,
    ...(fullName ? { fullName } : {}),
    ...(payload.parentPhone !== undefined ? { parentPhone: payload.parentPhone } : {}),
    ...(payload.parentName !== undefined ? { parentName: payload.parentName } : {})
  };
  return store.students[idx];
}

export async function remove(id) {
  getStore().students = getStore().students.filter((r) => r.id !== id);
}
