import { createId, getStore } from "./state.js";
import { buildTeacherLoginEmail } from "../../utils/email.js";

export async function getById(id) {
  const row = getStore().teachers.find((r) => String(r.id) === String(id));
  if (!row) throw new Error("Öğretmen bulunamadı.");
  return row;
}

export async function list({ onlyActive, q } = {}) {
  let rows = [...getStore().teachers];
  if (onlyActive) rows = rows.filter((r) => r.active);
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => {
      const haystack = `${r.fullName} ${r.email} ${r.branch} ${r.phone}`.toLowerCase();
      return haystack.includes(query);
    });
  }
  return rows;
}

export async function create(payload) {
  const firstName = payload.firstName ?? "";
  const lastName = payload.lastName ?? "";
  const row = {
    id: createId("tch"),
    ...payload,
    fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    email: payload.email || buildTeacherLoginEmail(firstName, lastName)
  };
  getStore().teachers.unshift(row);
  return row;
}

export async function update(id, payload) {
  const store = getStore();
  const idx = store.teachers.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Öğretmen bulunamadı.");
  const firstName = payload.firstName ?? store.teachers[idx].firstName ?? "";
  const lastName = payload.lastName ?? store.teachers[idx].lastName ?? "";
  store.teachers[idx] = {
    ...store.teachers[idx],
    ...payload,
    fullName: [firstName, lastName].filter(Boolean).join(" ").trim() || store.teachers[idx].fullName
  };
  return store.teachers[idx];
}

export async function remove(id) {
  getStore().teachers = getStore().teachers.filter((r) => r.id !== id);
}
