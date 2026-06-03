import { createId, getStore } from "./state.js";
import * as notificationsMock from "./notifications.mock.js";

export async function list({ q } = {}) {
  let rows = [...getStore().announcements];
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => `${r.title} ${r.body} ${r.scope} ${r.className || ""}`.toLowerCase().includes(query));
  }
  return rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function create(payload) {
  const createdAt = new Date().toISOString();
  const row = {
    id: createId("ann"),
    createdAt,
    ...payload
  };
  getStore().announcements.unshift(row);

  await notificationsMock.create({
    title: "Yeni duyuru",
    body: row.title,
    read: false,
    createdAt
  });

  return row;
}

export async function remove(id) {
  getStore().announcements = getStore().announcements.filter((r) => r.id !== id);
}
