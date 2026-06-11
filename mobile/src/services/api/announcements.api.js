import { API_BASE_URL } from "../config";
import { readStoredSession } from "../../auth/storage";
import { apiRequest } from "../httpClient";
import * as classesApi from "./classes.api";
import { buildClassMaps, unwrapList } from "./mappers";

function mapApiAttachment(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name ?? row.original_name ?? "",
    mimeType: row.mimeType ?? row.mime_type ?? "",
    size: Number(row.size ?? row.file_size ?? 0)
  };
}

function mapApiAnnouncementToUi(row, idToName) {
  if (!row) return row;
  const classId = row.class_id ?? row.classId;
  const rawAttachments = row.attachments ?? [];
  return {
    id: String(row.id),
    title: row.title ?? "",
    body: row.content ?? row.body ?? "",
    scope: classId != null && classId !== "" ? "CLASS" : "ALL",
    className: classId != null ? idToName.get(Number(classId)) ?? "" : "",
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    attachments: Array.isArray(rawAttachments) ? rawAttachments.map(mapApiAttachment) : []
  };
}

export function getAttachmentOpenUrl(announcementId, attachmentId, accessToken) {
  const params = new URLSearchParams();
  if (accessToken) params.set("accessToken", accessToken);
  const qs = params.toString();
  return `${API_BASE_URL}/announcements/${announcementId}/attachments/${attachmentId}/file${qs ? `?${qs}` : ""}`;
}

export async function listForUser() {
  const [data, classes] = await Promise.all([
    apiRequest("/announcements"),
    classesApi.list({})
  ]);
  const { idToName } = buildClassMaps(classes);
  return unwrapList(data).map((row) => mapApiAnnouncementToUi(row, idToName));
}

export async function openAttachment(announcementId, attachmentId) {
  const session = await readStoredSession();
  const url = getAttachmentOpenUrl(announcementId, attachmentId, session.accessToken);
  const { Linking } = await import("react-native");
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    throw new Error("Dosya acilamadi.");
  }
  await Linking.openURL(url);
}
