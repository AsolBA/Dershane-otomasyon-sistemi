import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./courses.service.js";

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  return sendSuccess(res, await svc.listCourses({ page, limit, offset }, req.query.search));
});

export const getById = asyncHandler(async (req, res) => {
  return sendSuccess(res, await svc.getCourseById(parseId(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || !b.code) throw new AppError(400, "VALIDATION_ERROR", "name ve code zorunludur.");
  return sendSuccess(res, await svc.createCourse(b), "Ders olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  return sendSuccess(res, await svc.updateCourse(parseId(req.params.id), req.body ?? {}), "Ders guncellendi.");
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteCourse(parseId(req.params.id));
  return sendSuccess(res, { deleted: true }, "Ders silindi.");
});

export const classCourses = asyncHandler(async (req, res) => {
  const classId = parseId(req.params.classId, "classId");
  return sendSuccess(res, await svc.listClassCourses(classId));
});

export const attachClass = asyncHandler(async (req, res) => {
  const classId = parseId(req.params.classId, "classId");
  const courseId = parseId(req.body?.courseId, "courseId");
  await svc.attachToClass(classId, courseId);
  return sendSuccess(res, { classId, courseId }, "Sinifa ders baglandi.", 201);
});

export const detachClass = asyncHandler(async (req, res) => {
  const classId = parseId(req.params.classId, "classId");
  const courseId = parseId(req.params.courseId, "courseId");
  await svc.detachFromClass(classId, courseId);
  return sendSuccess(res, { classId, courseId }, "Baglantı kaldirildi.");
});
