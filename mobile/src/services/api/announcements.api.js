import { apiRequest } from "../httpClient";
import * as classesApi from "./classes.api";
import { buildClassMaps, unwrapList } from "./mappers";

function mapApiAnnouncementToUi(row, idToName) {
  if (!row) return row;
  const classId = row.class_id ?? row.classId;
  return {
    id: row.id,
    title: row.title ?? "",
    body: row.content ?? row.body ?? "",
    scope: classId != null && classId !== "" ? "CLASS" : "ALL",
    className: classId != null ? idToName.get(Number(classId)) ?? "" : "",
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
  };
}

export async function listForUser() {
  const [data, classes] = await Promise.all([
    apiRequest("/announcements"),
    classesApi.list({})
  ]);
  const { idToName } = buildClassMaps(classes);
  return unwrapList(data).map((row) => mapApiAnnouncementToUi(row, idToName));
}
