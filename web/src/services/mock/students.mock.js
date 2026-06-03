import { createId, getStore } from "./state.js";

export async function getById(id) {
  const row = getStore().students.find((r) => r.id === id);
  if (!row) throw new Error("Öğrenci bulunamadı.");
  return row;
}

export async function list({ onlyActive, q } = {}) {
  let rows = [...getStore().students];
  if (onlyActive) rows = rows.filter((r) => r.active);
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => {
      const haystack = `${r.fullName} ${r.email} ${r.className} ${r.parentName} ${r.parentPhone}`.toLowerCase();
      return haystack.includes(query);
    });
  }
  return rows;
}

export async function create(payload) {
  const row = { id: createId("stu"), ...payload };
  getStore().students.unshift(row);
  return row;
}

export async function update(id, payload) {
  const store = getStore();
  const idx = store.students.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Öğrenci bulunamadı.");
  store.students[idx] = { ...store.students[idx], ...payload };
  return store.students[idx];
}

export async function remove(id) {
  getStore().students = getStore().students.filter((r) => r.id !== id);
}
