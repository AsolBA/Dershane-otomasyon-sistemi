import { apiRequest } from "../httpClient";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function list() {
  const data = await apiRequest("/notifications/me");
  return unwrapList(data);
}

export async function markRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllRead() {
  return apiRequest("/notifications/me/read-all", { method: "PATCH" });
}
