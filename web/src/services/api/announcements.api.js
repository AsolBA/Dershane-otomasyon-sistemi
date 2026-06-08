import { apiRequest } from "../httpClient.js";
import * as classesApi from "./classes.api.js";
import { buildClassMaps, resolveClassId, unwrapList } from "./mappers.js";

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

function filterAnnouncements(rows, q) {
  const term = String(q || "").trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((r) =>
    `${r.title} ${r.body} ${r.scope} ${r.className || ""}`.toLowerCase().includes(term)
  );
}

export async function list({ q } = {}) {
  const [data, classes] = await Promise.all([apiRequest("/announcements"), classesApi.list({})]);
  const { idToName } = buildClassMaps(classes);
  const rows = unwrapList(data).map((row) => mapApiAnnouncementToUi(row, idToName));
  return filterAnnouncements(rows, q);
}

export async function create(payload) {
  const title = String(payload.title || "").trim();
  const content = String(payload.body ?? payload.content ?? "").trim();
  const body = { title, content };

  if (payload.scope === "CLASS") {
    const className = String(payload.className || "").trim();
    if (!className) throw new Error("Sınıf duyurusu için sınıf seçimi zorunludur.");
    const classes = await classesApi.list({});
    const classId = resolveClassId(className, classes);
    if (classId == null) throw new Error(`"${className}" adlı sınıf bulunamadı.`);
    body.classId = classId;
  }

  return apiRequest("/announcements", { method: "POST", body: JSON.stringify(body) });
}

export async function remove(id) {
  return apiRequest(`/announcements/${id}`, { method: "DELETE" });
}
