import { apiRequest } from "../httpClient.js";
import { unwrapList } from "./mappers.js";

function mapApiNotificationToUi(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title ?? "",
    body: row.message ?? row.body ?? "",
    read: Boolean(row.is_read ?? row.read ?? false),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    type: row.notification_type ?? row.type ?? "general",
    refId: row.ref_id ?? row.refId ?? null,
    resetRequestStatus: row.reset_request_status ?? row.resetRequestStatus ?? null
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

export async function approvePasswordReset(requestId) {
  return apiRequest(`/password-reset-requests/${requestId}/approve`, { method: "PATCH" });
}

export async function rejectPasswordReset(requestId) {
  return apiRequest(`/password-reset-requests/${requestId}/reject`, { method: "PATCH" });
}

export async function remove(id) {
  return apiRequest(`/notifications/${id}`, { method: "DELETE" });
}

export async function removeMany(ids) {
  return apiRequest("/notifications/me/delete", {
    method: "POST",
    body: JSON.stringify({ ids })
  });
}
