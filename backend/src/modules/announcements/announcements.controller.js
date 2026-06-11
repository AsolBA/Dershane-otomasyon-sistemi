import fs from "node:fs";
import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./announcements.service.js";
import * as attachSvc from "./announcements.attachments.service.js";
import * as studentsSvc from "../students/students.service.js";

async function scopedFilters(req) {
  if (req.user.role === "student") {
    const sid = await studentsSvc.getStudentIdByUserId(req.user.id);
    if (!sid) return { studentAnnouncementsEmpty: true };

    const st = await studentsSvc.getStudentById(sid);

    return {
      studentAnnouncements: true,
      studentClassId: st.current_class_id ?? null,
    };
  }

  if (req.user.role === "parent") {
    return { parentAnnouncements: true };
  }

  return {};
}

function publicAttachments(attachments = []) {
  return attachments.map((a) => ({
    id: a.id,
    name: a.name,
    mimeType: a.mimeType,
    size: a.size,
    createdAt: a.createdAt,
  }));
}

async function enrichAnnouncementRows(items) {
  const ids = items.map((row) => row.id);
  const map = await attachSvc.listAttachmentsByAnnouncementIds(ids);
  return items.map((row) => ({
    ...row,
    attachments: publicAttachments(map.get(row.id) ?? []),
  }));
}

export const listAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const scope = await scopedFilters(req);

  const filters = {
    queryClassId:
      req.query.classId !== undefined && req.query.classId !== ""
        ? Number(req.query.classId)
        : undefined,
    queryRoleName: req.query.role,
    parentAnnouncements: Boolean(scope.parentAnnouncements),
    studentAnnouncementsEmpty: Boolean(scope.studentAnnouncementsEmpty),
    studentAnnouncements: Boolean(scope.studentAnnouncements),
    studentClassId: typeof scope.studentClassId !== "undefined" ? scope.studentClassId : undefined,
  };

  const data = await svc.listAnnouncements(filters, { page, limit, offset });
  data.items = await enrichAnnouncementRows(data.items);
  return sendSuccess(res, data);
});

export const getAnnouncement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await attachSvc.assertUserCanAccessAnnouncement(req.user, id);
  const row = await svc.getAnnouncementById(id);
  const attachments = await attachSvc.listAttachmentsForAnnouncement(id);
  return sendSuccess(res, { ...row, attachments: publicAttachments(attachments) });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.title || !b.content) {
    throw new AppError(400, "VALIDATION_ERROR", "title ve content zorunludur.");
  }

  const created = await svc.createAnnouncement({
    title: b.title,
    content: b.content,
    targetRoleId: b.targetRoleId,
    targetRoleName: b.targetRoleName,
    classId: b.classId,
    createdBy: req.user.id,
  });

  return sendSuccess(res, { ...created, attachments: [] }, "Duyuru olusturuldu.", 201);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const updated = await svc.updateAnnouncement(id, req.body ?? {});
  const attachments = await attachSvc.listAttachmentsForAnnouncement(id);
  return sendSuccess(res, { ...updated, attachments: publicAttachments(attachments) }, "Duyuru guncellendi.");
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const attachments = await attachSvc.listAttachmentsForAnnouncement(id);
  await svc.deleteAnnouncement(id);
  for (const file of attachments) {
    await attachSvc.deleteAttachmentFileFromDisk(file.storedName);
  }
  return sendSuccess(res, { deleted: true }, "Duyuru silindi.");
});

export const uploadAttachments = asyncHandler(async (req, res) => {
  const announcementId = parseId(req.params.id);
  const files = req.files ?? [];
  if (!files.length) {
    throw new AppError(400, "VALIDATION_ERROR", "En az bir dosya secin.");
  }
  const created = await attachSvc.addAttachments(announcementId, files);
  return sendSuccess(res, publicAttachments(created), "Ekler yuklendi.", 201);
});

export const downloadAttachment = asyncHandler(async (req, res) => {
  const announcementId = parseId(req.params.id);
  const attachmentId = parseId(req.params.attachmentId, "attachmentId");
  const { attachment, filePath } = await attachSvc.getAttachmentFileForDownload(
    req.user,
    announcementId,
    attachmentId,
  );

  res.setHeader("Content-Type", attachment.mimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(attachment.name)}"`);
  fs.createReadStream(filePath).pipe(res);
});
