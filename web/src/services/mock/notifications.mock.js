import { createId, getStore } from "./state.js";

export async function list() {
  return [...getStore().notifications].sort((a, b) => {
    if (Boolean(a.read) !== Boolean(b.read)) return a.read ? 1 : -1;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

export async function create(payload) {
  const row = { id: createId("ntf"), read: false, ...payload };
  getStore().notifications.unshift(row);
  return row;
}

export async function markRead(id) {
  const store = getStore();
  const idx = store.notifications.findIndex((r) => r.id === id);
  if (idx === -1) return;
  store.notifications[idx] = { ...store.notifications[idx], read: true };
}

export async function markAllRead() {
  getStore().notifications = getStore().notifications.map((r) => ({ ...r, read: true }));
}

export async function approvePasswordReset() {
  return { approved: true };
}

export async function rejectPasswordReset() {
  return { rejected: true };
}

export async function remove(id) {
  const store = getStore();
  store.notifications = store.notifications.filter((r) => String(r.id) !== String(id));
}

export async function removeMany(ids) {
  const set = new Set((ids ?? []).map(String));
  const store = getStore();
  store.notifications = store.notifications.filter((r) => !set.has(String(r.id)));
}
