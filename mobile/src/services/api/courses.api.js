import { apiRequest } from "../httpClient";
import { unwrapList } from "./mappers";

export async function list({ onlyActive } = {}) {
  const data = await apiRequest("/courses");
  const rows = unwrapList(data).map((row) => ({
    id: row.id,
    name: row.name ?? "",
    code: row.code ?? "",
    active: true
  }));
  return onlyActive ? rows.filter((r) => r.active) : rows;
}
