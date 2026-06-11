import fs from "node:fs/promises";
import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { getAttachmentFilePath } from "../../utils/announcement-upload.js";
import * as studentsSvc from "../students/students.service.js";
import { getAnnouncementById } from "./announcements.service.js";

function mapAttachmentRow(row) {
  return {
    id: row.id,
    announcementId: row.announcement_id,
    name: row.original_name,
    mimeType: row.mime_type,
    size: Number(row.file_size),
    storedName: row.stored_name,
    createdAt: row.created_at,
  };
}

export async function listAttachmentsForAnnouncement(announcementId) {
  const rows = await query(
    `
    SELECT id, announcement_id, original_name, stored_name, mime_type, file_size, created_at
    FROM announcement_attachments
    WHERE announcement_id = $1
    ORDER BY id ASC`,
    [announcementId],
  );
  return rows.rows.map(mapAttachmentRow);
}

export async function listAttachmentsByAnnouncementIds(announcementIds) {
  if (!announcementIds.length) return new Map();
  const rows = await query(
    `
    SELECT id, announcement_id, original_name, stored_name, mime_type, file_size, created_at
    FROM announcement_attachments
    WHERE announcement_id = ANY($1::bigint[])
    ORDER BY id ASC`,
    [announcementIds],
  );
  const map = new Map();
  for (const row of rows.rows) {
    const mapped = mapAttachmentRow(row);
    const list = map.get(mapped.announcementId) ?? [];
    list.push(mapped);
    map.set(mapped.announcementId, list);
  }
  return map;
}

export async function addAttachments(announcementId, files) {
  await getAnnouncementById(announcementId);
  const created = [];
  for (const file of files) {
    const inserted = await query(
      `
      INSERT INTO announcement_attachments (announcement_id, original_name, stored_name, mime_type, file_size)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, announcement_id, original_name, stored_name, mime_type, file_size, created_at`,
      [announcementId, file.originalname, file.filename, file.mimetype, file.size],
    );
    created.push(mapAttachmentRow(inserted.rows[0]));
  }
  return created;
}

export async function getAttachmentById(attachmentId) {
  const r = await query(`SELECT * FROM announcement_attachments WHERE id = $1`, [attachmentId]);
  if (!r.rows[0]) throw new AppError(404, "ATTACHMENT_NOT_FOUND", "Ek dosya bulunamadi.");
  return mapAttachmentRow(r.rows[0]);
}

export async function assertUserCanAccessAnnouncement(user, announcementId) {
  const ann = await getAnnouncementById(announcementId);

  if (["admin", "manager", "teacher"].includes(user.role)) {
    return ann;
  }

  if (user.role === "student") {
    const sid = await studentsSvc.getStudentIdByUserId(user.id);
    if (!sid) throw new AppError(403, "AUTH_FORBIDDEN", "Bu duyuruya erisemezsiniz.");

    const st = await studentsSvc.getStudentById(sid);
    const roleRes = await query(`SELECT name FROM roles WHERE id = $1`, [ann.target_role_id]);
    const roleName = roleRes.rows[0]?.name ?? null;

    const roleOk = ann.target_role_id == null || roleName === "student";
    const classOk = ann.class_id == null || Number(ann.class_id) === Number(st.current_class_id);
    if (!roleOk || !classOk) {
      throw new AppError(403, "AUTH_FORBIDDEN", "Bu duyuruya erisemezsiniz.");
    }
    return ann;
  }

  if (user.role === "parent") {
    const roleRes = await query(`SELECT name FROM roles WHERE id = $1`, [ann.target_role_id]);
    const roleName = roleRes.rows[0]?.name ?? null;
    const roleOk = ann.target_role_id == null || roleName === "parent";
    if (!roleOk) {
      throw new AppError(403, "AUTH_FORBIDDEN", "Bu duyuruya erisemezsiniz.");
    }
    return ann;
  }

  throw new AppError(403, "AUTH_FORBIDDEN", "Bu duyuruya erisemezsiniz.");
}

export async function getAttachmentFileForDownload(user, announcementId, attachmentId) {
  await assertUserCanAccessAnnouncement(user, announcementId);
  const attachment = await getAttachmentById(attachmentId);
  if (Number(attachment.announcementId) !== Number(announcementId)) {
    throw new AppError(404, "ATTACHMENT_NOT_FOUND", "Ek dosya bulunamadi.");
  }
  const filePath = getAttachmentFilePath(attachment.storedName);
  return { attachment, filePath };
}

export async function deleteAttachmentFileFromDisk(storedName) {
  try {
    await fs.unlink(getAttachmentFilePath(storedName));
  } catch {
    /* ignore missing file */
  }
}
