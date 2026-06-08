import { apiRequest } from "../httpClient.js";
import { joinFullName, unwrapList } from "./mappers.js";

function mapApiParentToUi(row) {
  if (!row) return row;
  return {
    id: row.id,
    fullName: joinFullName(row.first_name ?? row.firstName, row.last_name ?? row.lastName),
    email: row.email ?? "",
    phone: row.phone ?? ""
  };
}

export async function list() {
  const data = await apiRequest("/parents");
  return unwrapList(data).map(mapApiParentToUi);
}
