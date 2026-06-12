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

export async function remove(id) {
  const idx = initialNotifications.findIndex((n) => String(n.id) === String(id));
  if (idx >= 0) initialNotifications.splice(idx, 1);
}

export async function removeMany(ids) {
  const set = new Set((ids ?? []).map(String));
  for (let i = initialNotifications.length - 1; i >= 0; i -= 1) {
    if (set.has(String(initialNotifications[i].id))) {
      initialNotifications.splice(i, 1);
    }
  }
}
