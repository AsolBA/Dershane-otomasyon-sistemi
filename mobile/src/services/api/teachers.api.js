import { apiRequest } from "../httpClient";
import { joinFullName, unwrapList } from "./mappers";

function mapApiTeacherToUi(row) {
  if (!row) return row;
  const firstName = row.first_name ?? row.firstName ?? "";
  const lastName = row.last_name ?? row.lastName ?? "";
  return {
    id: row.id,
    fullName: joinFullName(firstName, lastName) || row.fullName || "",
    branch: row.branch ?? "",
    active: Boolean(row.is_active ?? row.isActive ?? row.active ?? true)
  };
}

export async function list({ onlyActive } = {}) {
  const data = await apiRequest("/teachers");
  let rows = unwrapList(data).map(mapApiTeacherToUi);
  if (onlyActive) rows = rows.filter((r) => r.active);
  return rows;
}
