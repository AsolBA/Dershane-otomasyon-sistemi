import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./announcements.service.js";
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
  return sendSuccess(res, data);
});


export const getAnnouncement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const row = await svc.getAnnouncementById(id);
  return sendSuccess(res, row);
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

  return sendSuccess(res, created, "Duyuru olusturuldu.", 201);
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const updated = await svc.updateAnnouncement(id, req.body ?? {});
  return sendSuccess(res, updated, "Duyuru guncellendi.");
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await svc.deleteAnnouncement(id);
  return sendSuccess(res, { deleted: true }, "Duyuru silindi.");
});
