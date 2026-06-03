import { apiRequest } from "../httpClient.js";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function list({ q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  const data = await apiRequest(`/announcements?${params.toString()}`);
  return unwrapList(data);
}

export async function create(payload) {
  return apiRequest("/announcements", { method: "POST", body: JSON.stringify(payload) });
}

export async function remove(id) {
  return apiRequest(`/announcements/${id}`, { method: "DELETE" });
}
