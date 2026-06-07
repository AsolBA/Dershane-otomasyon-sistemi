import { apiRequest } from "../httpClient.js";
import { unwrapList } from "./mappers.js";

function mapApiCourseToUi(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name ?? "",
    code: row.code ?? "",
    active: true
  };
}

export async function list({ onlyActive, q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  const data = await apiRequest(`/courses?${params.toString()}`);
  const rows = unwrapList(data).map(mapApiCourseToUi);
  return onlyActive ? rows.filter((r) => r.active) : rows;
}

export async function create(payload) {
  const row = await apiRequest("/courses", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      code: payload.code,
      description: payload.description ?? null
    })
  });
  return mapApiCourseToUi(row);
}

export async function update(id, payload) {
  const body = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.code !== undefined) body.code = payload.code;
  const row = await apiRequest(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapApiCourseToUi(row);
}

export async function remove(id) {
  return apiRequest(`/courses/${id}`, { method: "DELETE" });
}
