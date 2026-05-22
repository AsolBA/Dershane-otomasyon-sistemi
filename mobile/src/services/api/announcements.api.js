import { apiRequest } from "../httpClient";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function listForUser() {
  const data = await apiRequest("/announcements");
  return unwrapList(data);
}
