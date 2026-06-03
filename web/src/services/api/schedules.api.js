import { apiRequest } from "../httpClient.js";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function list({ day, q } = {}) {
  const params = new URLSearchParams();
  if (day && day !== "ALL") params.set("day", day);
  if (q) params.set("search", q);
  const data = await apiRequest(`/schedules?${params.toString()}`);
  return unwrapList(data);
}

export async function checkConflict(candidate, ignoreId) {
  return apiRequest("/schedules/conflict-check", {
    method: "POST",
    body: JSON.stringify({ ...candidate, ignoreId })
  });
}

export async function create(payload) {
  return apiRequest("/schedules", { method: "POST", body: JSON.stringify(payload) });
}

export async function update(id, payload) {
  return apiRequest(`/schedules/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function remove(id) {
  return apiRequest(`/schedules/${id}`, { method: "DELETE" });
}
