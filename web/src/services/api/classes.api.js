import { apiRequest } from "../httpClient.js";
import { unwrapList } from "./mappers.js";

function mapApiClassToUi(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name ?? "",
    gradeLevel: String(row.level ?? row.gradeLevel ?? ""),
    capacity: row.capacity ?? 30,
    active: row.active !== undefined ? Boolean(row.active) : true
  };
}

function uiPayloadToApi(payload) {
  const level = Number(payload.gradeLevel);
  if (!payload.name?.trim()) throw new Error("Sınıf adı zorunludur.");
  if (!Number.isFinite(level) || level <= 0) throw new Error("Geçerli bir seviye girin.");
  return {
    name: payload.name.trim(),
    level
  };
}

export async function list({ onlyActive, q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  const data = await apiRequest(`/classes?${params.toString()}`);
  let rows = unwrapList(data).map(mapApiClassToUi);
  if (onlyActive) rows = rows.filter((r) => r.active);
  return rows;
}

export async function create(payload) {
  const body = uiPayloadToApi(payload);
  const row = await apiRequest("/classes", { method: "POST", body: JSON.stringify(body) });
  return mapApiClassToUi(row);
}

export async function update(id, payload) {
  const body = uiPayloadToApi(payload);
  const row = await apiRequest(`/classes/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapApiClassToUi(row);
}

export async function remove(id) {
  return apiRequest(`/classes/${id}`, { method: "DELETE" });
}
