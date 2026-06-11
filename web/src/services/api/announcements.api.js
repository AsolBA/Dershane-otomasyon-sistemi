import { API_BASE_URL } from "../config.js";
import { readStoredSession } from "../../auth/storage.js";
import { apiRequest } from "../httpClient.js";
import * as classesApi from "./classes.api.js";
import { buildClassMaps, resolveClassId, unwrapList } from "./mappers.js";

function mapApiAttachment(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name ?? row.original_name ?? "",
    mimeType: row.mimeType ?? row.mime_type ?? "",
    size: Number(row.size ?? row.file_size ?? 0),
    createdAt: row.created_at ?? row.createdAt
  };
}

function mapApiAnnouncementToUi(row, idToName) {
  if (!row) return row;
  const classId = row.class_id ?? row.classId;
  const rawAttachments = row.attachments ?? [];
  return {
    id: row.id,
    title: row.title ?? "",
    body: row.content ?? row.body ?? "",
    scope: classId != null && classId !== "" ? "CLASS" : "ALL",
    className: classId != null ? idToName.get(Number(classId)) ?? "" : "",
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    attachments: Array.isArray(rawAttachments) ? rawAttachments.map(mapApiAttachment) : []
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

  const created = await apiRequest("/announcements", { method: "POST", body: JSON.stringify(body) });
  const announcementId = created?.id;
  if (announcementId && payload.files?.length) {
    await uploadAttachments(announcementId, payload.files);
  }
  return created;
}

export async function uploadAttachments(announcementId, fileList) {
  const form = new FormData();
  for (const file of fileList) {
    form.append("files", file);
  }

  const session = readStoredSession();
  const headers = {};
  if (session.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const res = await fetch(`${API_BASE_URL}/announcements/${announcementId}/attachments`, {
    method: "POST",
    headers,
    body: form
  });

  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text };
  }

  if (!res.ok) {
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  const data = body?.data ?? body;
  const rows = Array.isArray(data) ? data : unwrapList(data);
  return rows.map(mapApiAttachment);
}

export async function downloadAttachment(announcementId, attachmentId, fileName) {
  const session = readStoredSession();
  const headers = {};
  if (session.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const res = await fetch(
    `${API_BASE_URL}/announcements/${announcementId}/attachments/${attachmentId}/file`,
    { headers }
  );

  if (!res.ok) {
    const text = await res.text();
    let message = `HTTP ${res.status}`;
    try {
      message = JSON.parse(text)?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "ek";
  a.click();
  URL.revokeObjectURL(url);
}

export async function remove(id) {
  return apiRequest(`/announcements/${id}`, { method: "DELETE" });
}
