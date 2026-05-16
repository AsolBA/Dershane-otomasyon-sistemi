import { apiRequest } from "../httpClient.js";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function list({ onlyActive, q } = {}) {
  const params = new URLSearchParams();
  if (onlyActive) params.set("isActive", "true");
  if (q) params.set("search", q);
  const data = await apiRequest(`/students?${params.toString()}`);
  return unwrapList(data);
}

export async function create(payload) {
  return apiRequest("/students", { method: "POST", body: JSON.stringify(payload) });
}

export async function update(id, payload) {
  return apiRequest(`/students/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function remove(id) {
  return apiRequest(`/students/${id}`, { method: "DELETE" });
}
