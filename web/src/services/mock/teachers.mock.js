import { createId, getStore } from "./state.js";

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
  const row = { id: createId("tch"), ...payload };
  getStore().teachers.unshift(row);
  return row;
}

export async function update(id, payload) {
  const store = getStore();
  const idx = store.teachers.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Öğretmen bulunamadı.");
  store.teachers[idx] = { ...store.teachers[idx], ...payload };
  return store.teachers[idx];
}

export async function remove(id) {
  getStore().teachers = getStore().teachers.filter((r) => r.id !== id);
}
