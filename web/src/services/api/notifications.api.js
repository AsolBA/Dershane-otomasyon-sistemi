import { apiRequest } from "../httpClient.js";
import { unwrapList } from "./mappers.js";

function mapApiNotificationToUi(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title ?? "",
    body: row.message ?? row.body ?? "",
    read: Boolean(row.is_read ?? row.read ?? false),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
  };
}

export async function list() {
  const data = await apiRequest("/notifications/me");
  return unwrapList(data).map(mapApiNotificationToUi);
}

export async function markRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllRead() {
  return apiRequest("/notifications/me/read-all", { method: "PATCH" });
}
