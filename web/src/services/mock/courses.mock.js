import { createId, getStore } from "./state.js";

export async function list({ onlyActive, q } = {}) {
  let rows = [...getStore().courses];
  if (onlyActive) rows = rows.filter((r) => r.active);
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => `${r.name} ${r.code}`.toLowerCase().includes(query));
  }
  return rows;
}

export async function create(payload) {
  const dup = getStore().courses.some((r) => r.code === payload.code);
  if (dup) throw new Error("Bu ders kodu zaten var.");
  const row = { id: createId("crs"), ...payload };
  getStore().courses.unshift(row);
  return row;
}

export async function update(id, payload) {
  const store = getStore();
  const dup = store.courses.some((r) => r.code === payload.code && r.id !== id);
  if (dup) throw new Error("Bu ders kodu zaten var.");
  const idx = store.courses.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Ders bulunamadı.");
  store.courses[idx] = { ...store.courses[idx], ...payload };
  return store.courses[idx];
}

export async function remove(id) {
  getStore().courses = getStore().courses.filter((r) => r.id !== id);
}
