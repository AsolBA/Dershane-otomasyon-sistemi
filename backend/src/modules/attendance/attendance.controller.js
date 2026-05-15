import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./attendance.service.js";
import * as teachersSvc from "../teachers/teachers.service.js";
import * as studentsSvc from "../students/students.service.js";

const allowedStatuses = new Set(["present", "absent", "late", "excused"]);

async function scopeStudentFilter(req, filters) {
  if (req.user.role === "student") {
    const sid = await studentsSvc.getStudentIdByUserId(req.user.id);
    filters.studentId = sid ?? -1;
  }
  if (req.user.role === "parent") {
    const pid = await studentsSvc.getParentIdByUserId(req.user.id);
    if (!filters.studentId) {
      throw new AppError(400, "ATTENDANCE_STUDENT_REQUIRED", "Veli olarak studentId parametresi gerekli.");
    }
    const st = await studentsSvc.getStudentById(filters.studentId);
    if (Number(st.parent_id) !== Number(pid)) {
      throw new AppError(403, "AUTH_FORBIDDEN", "Bu ogrencinin yoklamasini goremezsiniz.");
    }
  }
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = {
    studentId: req.query.studentId ? Number(req.query.studentId) : undefined,
    scheduleId: req.query.scheduleId ? Number(req.query.scheduleId) : undefined,
    classId: req.query.classId ? Number(req.query.classId) : undefined,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
    status: req.query.status,
  };

  await scopeStudentFilter(req, filters);

  if (req.user.role === "teacher") {
    const tid = await teachersSvc.getTeacherIdByUserId(req.user.id);
    filters.teacherId = tid ?? -1;
  }

  const data = await svc.listAttendance(filters, { page, limit, offset });
  return sendSuccess(res, data);
});

export const report = asyncHandler(async (req, res) => {
  const filters = {
    classId: req.query.classId ? Number(req.query.classId) : undefined,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
  };
  if (!filters.fromDate || !filters.toDate) {
    throw new AppError(400, "ATTENDANCE_REPORT_RANGE_REQUIRED", "fromDate ve toDate zorunludur (YYYY-MM-DD).");
  }
  if (!filters.classId) {
    throw new AppError(400, "ATTENDANCE_CLASS_REQUIRED", "classId zorunludur.");
  }

  if (req.user.role === "parent" || req.user.role === "student") {
    throw new AppError(403, "AUTH_FORBIDDEN", "Bu raporu goruntuleyemezsiniz.");
  }
  if (req.user.role === "teacher") {
    const tid = await teachersSvc.getTeacherIdByUserId(req.user.id);
    filters.teacherId = tid ?? -1;
  }

  const data = await svc.attendanceReport(filters);
  return sendSuccess(res, data);
});

export const mark = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  const status = b.status;
  if (!allowedStatuses.has(status)) {
    throw new AppError(400, "ATTENDANCE_INVALID_STATUS", "status present|absent|late|excused olmalidir.");
  }
  if (!b.studentId || !b.scheduleId || !b.attendanceDate) {
    throw new AppError(400, "VALIDATION_ERROR", "studentId, scheduleId, attendanceDate zorunludur.");
  }
  await svc.assertScheduleOwnedByTeacher(req, Number(b.scheduleId));
  const row = await svc.upsertAttendance(
    {
      studentId: Number(b.studentId),
      scheduleId: Number(b.scheduleId),
      attendanceDate: b.attendanceDate,
      status,
      note: b.note,
    },
    req.user.id,
  );
  return sendSuccess(res, row, "Yoklama kaydedildi.", 201);
});

export const patch = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await svc.assertAttendanceOwnedByTeacher(req, id);
  const updated = await svc.updateAttendance(id, {
    ...req.body,
    markedBy: req.user.id,
  });
  return sendSuccess(res, updated, "Yoklama guncellendi.");
});
