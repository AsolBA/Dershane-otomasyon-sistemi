import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, optionalBool, parsePagination } from "../../utils/query-params.js";
import * as studentsService from "./students.service.js";

async function assertCanViewStudent(req, studentId) {
  if (["admin", "manager", "teacher"].includes(req.user.role)) return;

  if (req.user.role === "student") {
    const sid = await studentsService.getStudentIdByUserId(req.user.id);
    if (Number(sid) !== Number(studentId)) {
      throw new AppError(403, "AUTH_FORBIDDEN", "Bu kayda erisemezsiniz.");
    }
    return;
  }

  if (req.user.role === "parent") {
    const pid = await studentsService.getParentIdByUserId(req.user.id);
    if (!pid) throw new AppError(403, "AUTH_FORBIDDEN", "Veli profili bulunamadi.");
    const st = await studentsService.getStudentById(studentId);
    if (Number(st.parent_id) !== Number(pid)) {
      throw new AppError(403, "AUTH_FORBIDDEN", "Bu ogrenciyi goruntuleyemezsiniz.");
    }
    return;
  }

  throw new AppError(403, "AUTH_FORBIDDEN", "Bu islem icin yetkiniz yok.");
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = {
    classId: req.query.classId ? Number(req.query.classId) : undefined,
    studentNo: req.query.studentNo,
    search: req.query.search,
    isActive: optionalBool(req.query.isActive),
  };

  if (req.user.role === "parent") {
    const pid = await studentsService.getParentIdByUserId(req.user.id);
    filters.parentId = pid ?? -1;
  } else if (req.user.role === "student") {
    filters.userId = req.user.id;
  }

  const data = await studentsService.listStudents(filters, { page, limit, offset });
  return sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "studentId");
  await assertCanViewStudent(req, id);
  const student = await studentsService.getStudentById(id);
  return sendSuccess(res, student);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  if (!body.firstName || !body.lastName || !body.email || !body.studentNo) {
    throw new AppError(400, "VALIDATION_ERROR", "firstName, lastName, email, studentNo zorunludur.");
  }
  const student = await studentsService.createStudent(body);
  return sendSuccess(res, student, "Ogrenci olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "studentId");
  const student = await studentsService.updateStudent(id, req.body ?? {});
  return sendSuccess(res, student, "Ogrenci guncellendi.");
});

export const addClass = asyncHandler(async (req, res) => {
  const studentId = parseId(req.params.id, "studentId");
  const classId = parseId(req.body?.classId, "classId");
  const out = await studentsService.addStudentToClass(classId, studentId);
  return sendSuccess(res, out, "Sinifa eklendi.", 201);
});

export const removeClass = asyncHandler(async (req, res) => {
  const studentId = parseId(req.params.id, "studentId");
  const classId = parseId(req.params.classId, "classId");
  const out = await studentsService.removeStudentFromClass(classId, studentId);
  return sendSuccess(res, out, "Siniftan cikarildi.");
});
