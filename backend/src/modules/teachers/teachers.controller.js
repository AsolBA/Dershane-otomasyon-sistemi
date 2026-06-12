import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { optionalBool, parseId, parsePagination } from "../../utils/query-params.js";
import { decryptLoginPassword } from "../../utils/login-password-storage.js";
import * as svc from "./teachers.service.js";

function attachAdminLoginPasswords(teacher, role) {
  const payload = { ...teacher };
  if (["admin", "manager"].includes(role)) {
    payload.loginPassword = decryptLoginPassword(teacher.login_password_enc);
  }
  delete payload.login_password_enc;
  return payload;
}

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
  return sendSuccess(res, attachAdminLoginPasswords(await svc.getTeacherById(id), req.user.role));
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.firstName || !b.lastName || !b.email || !b.branch) {
    throw new AppError(400, "VALIDATION_ERROR", "firstName, lastName, email, branch zorunludur.");
  }
  const teacher = await svc.createTeacher(b);
  return sendSuccess(res, attachAdminLoginPasswords(teacher, req.user.role), "Ogretmen olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "teacherId");
  const teacher = await svc.updateTeacher(id, req.body ?? {});
  return sendSuccess(res, attachAdminLoginPasswords(teacher, req.user.role), "Ogretmen guncellendi.");
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
