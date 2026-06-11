import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { optionalBool, parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./teachers.service.js";

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const search = req.query.search;
  let data;
  if (req.user.role === "teacher") {
    const tid = await svc.getTeacherIdByUserId(req.user.id);
    if (!tid) throw new AppError(404, "TEACHER_PROFILE_NOT_FOUND", "Ogretmen profili yok.");
    const me = await svc.getTeacherById(tid);
    data = { items: [me], total: 1, page: 1, limit };
  } else {
    data = await svc.listTeachers(
      { page, limit, offset },
      search,
      { isActive: optionalBool(req.query.isActive) },
    );
  }
  return sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "teacherId");
  if (req.user.role === "teacher") {
    const tid = await svc.getTeacherIdByUserId(req.user.id);
    if (Number(tid) !== id) {
      throw new AppError(403, "AUTH_FORBIDDEN", "Sadece kendi profilinizi gorebilirsiniz.");
    }
  }
  return sendSuccess(res, await svc.getTeacherById(id));
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.firstName || !b.lastName || !b.email || !b.branch) {
    throw new AppError(400, "VALIDATION_ERROR", "firstName, lastName, email, branch zorunludur.");
  }
  return sendSuccess(res, await svc.createTeacher(b), "Ogretmen olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "teacherId");
  return sendSuccess(res, await svc.updateTeacher(id, req.body ?? {}), "Ogretmen guncellendi.");
});

export const listCourses = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "teacherId");
  return sendSuccess(res, await svc.listTeacherCourses(id));
});

export const addCourse = asyncHandler(async (req, res) => {
  const teacherId = parseId(req.params.id, "teacherId");
  const courseId = parseId(req.body?.courseId, "courseId");
  await svc.assignCourse(teacherId, courseId);
  return sendSuccess(res, { teacherId, courseId }, "Ders atandi.", 201);
});

export const removeCourse = asyncHandler(async (req, res) => {
  const teacherId = parseId(req.params.id, "teacherId");
  const courseId = parseId(req.params.courseId, "courseId");
  await svc.unassignCourse(teacherId, courseId);
  return sendSuccess(res, { teacherId, courseId }, "Atama kaldirildi.");
});
