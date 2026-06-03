import { initialNotifications } from "./mockStore";

export async function list() {
  return [...initialNotifications].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function markRead(id) {
  const row = initialNotifications.find((n) => n.id === id);
  if (row) row.read = true;
}

export async function markAllRead() {
  initialNotifications.forEach((n) => {
    n.read = true;
  });
}
