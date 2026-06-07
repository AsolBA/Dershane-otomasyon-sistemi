import { apiRequest } from "../httpClient";
import { unwrapList } from "./mappers";

export async function list({ onlyActive, q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  const data = await apiRequest(`/classes?${params.toString()}`);
  let rows = unwrapList(data).map((row) => ({
    id: row.id,
    name: row.name ?? "",
    gradeLevel: String(row.level ?? row.gradeLevel ?? ""),
    active: true
  }));
  if (onlyActive) rows = rows.filter((r) => r.active);
  return rows;
}
