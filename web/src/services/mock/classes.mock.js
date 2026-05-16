import { createId, getStore } from "./state.js";

export async function list({ onlyActive, q } = {}) {
  let rows = [...getStore().classes];
  if (onlyActive) rows = rows.filter((r) => r.active);
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => `${r.name} ${r.gradeLevel}`.toLowerCase().includes(query));
  }
  return rows;
}

export async function create(payload) {
  const row = { id: createId("cls"), ...payload };
  getStore().classes.unshift(row);
  return row;
}

export async function update(id, payload) {
  const store = getStore();
  const idx = store.classes.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Sinif bulunamadi.");
  store.classes[idx] = { ...store.classes[idx], ...payload };
  return store.classes[idx];
}

export async function remove(id) {
  getStore().classes = getStore().classes.filter((r) => r.id !== id);
}
