import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./schedules.service.js";
import * as teachersSvc from "../teachers/teachers.service.js";
import * as studentsSvc from "../students/students.service.js";

async function assertTeacherOwnsSchedule(req, scheduleRow) {
  if (!["teacher"].includes(req.user.role)) return;
  const tid = await teachersSvc.getTeacherIdByUserId(req.user.id);
  if (Number(tid) !== Number(scheduleRow.teacher_id)) {
    throw new AppError(403, "AUTH_FORBIDDEN", "Bu program kaydinda islem yapamazsiniz.");
  }
}

async function assertTeacherPayload(req, payload) {
  if (req.user.role !== "teacher") return;
  const tid = await teachersSvc.getTeacherIdByUserId(req.user.id);
  if (Number(payload.teacherId) !== Number(tid)) {
    throw new AppError(403, "AUTH_FORBIDDEN", "Sadece kendi adiniza program ekleyebilirsiniz.");
  }
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = {
    classId: req.query.classId ? Number(req.query.classId) : undefined,
    teacherId: req.query.teacherId ? Number(req.query.teacherId) : undefined,
    courseId: req.query.courseId ? Number(req.query.courseId) : undefined,
    dayOfWeek: req.query.dayOfWeek ? Number(req.query.dayOfWeek) : undefined,
  };

  if (req.user.role === "teacher") {
    const tid = await teachersSvc.getTeacherIdByUserId(req.user.id);
    filters.teacherId = tid ?? -1;
  }

  if (req.user.role === "student") {
    const sid = await studentsSvc.getStudentIdByUserId(req.user.id);
    if (!sid) {
      return sendSuccess(res, { items: [], total: 0, page, limit });
    }
    const st = await studentsSvc.getStudentById(sid);
    filters.classId = st.current_class_id ?? -1;
  }

  if (req.user.role === "parent") {
    const pid = await studentsSvc.getParentIdByUserId(req.user.id);
    if (!pid) {
      return sendSuccess(res, { items: [], total: 0, page, limit });
    }
    const children = await studentsSvc.listStudents({ parentId: pid, isActive: true }, { page: 1, limit: 1, offset: 0 });
    const child = children.items[0];
    if (!child?.current_class_id) {
      return sendSuccess(res, { items: [], total: 0, page, limit });
    }
    filters.classId = child.current_class_id;
  }

  const data = await svc.listSchedules(filters, { page, limit, offset });
  return sendSuccess(res, data);
});

export const conflictCheck = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  const payload = {
    classId: Number(b.classId),
    courseId: Number(b.courseId),
    teacherId: Number(b.teacherId),
    dayOfWeek: Number(b.dayOfWeek),
    startTime: b.startTime,
    endTime: b.endTime,
    room: b.room,
  };
  if (
    ![payload.classId, payload.courseId, payload.teacherId, payload.dayOfWeek].every(
      (x) => Number.isInteger(x) && x >= 1,
    ) ||
    !payload.startTime ||
    !payload.endTime
  ) {
    throw new AppError(400, "VALIDATION_ERROR", "classId, courseId, teacherId, dayOfWeek, startTime, endTime zorunlu.");
  }
  await assertTeacherPayload(req, payload);
  try {
    await svc.assertNoScheduleConflict(payload, b.excludeScheduleId ? Number(b.excludeScheduleId) : null);
  } catch (e) {
    if (e.code === "SCHEDULE_CONFLICT") {
      return sendSuccess(res, { hasConflict: true, conflicts: e.details ?? null }, undefined, 200);
    }
    throw e;
  }
  return sendSuccess(res, { hasConflict: false });
});

export const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "scheduleId");
  const row = await svc.getScheduleById(id);
  await assertTeacherOwnsSchedule(req, row);
  return sendSuccess(res, row);
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  const payload = {
    classId: Number(b.classId),
    courseId: Number(b.courseId),
    teacherId: Number(b.teacherId),
    dayOfWeek: Number(b.dayOfWeek),
    startTime: b.startTime,
    endTime: b.endTime,
    room: b.room,
  };
  if (
    ![payload.classId, payload.courseId, payload.teacherId, payload.dayOfWeek].every(
      (x) => Number.isInteger(x) && x >= 1,
    ) ||
    !payload.startTime ||
    !payload.endTime
  ) {
    throw new AppError(400, "VALIDATION_ERROR", "classId, courseId, teacherId, dayOfWeek, startTime, endTime zorunlu.");
  }
  await assertTeacherPayload(req, payload);
  const created = await svc.createSchedule(payload);
  return sendSuccess(res, created, "Program olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "scheduleId");
  const existing = await svc.getScheduleById(id);
  await assertTeacherOwnsSchedule(req, existing);

  const b = req.body ?? {};
  const payload = {
    classId: b.classId !== undefined ? Number(b.classId) : undefined,
    courseId: b.courseId !== undefined ? Number(b.courseId) : undefined,
    teacherId: b.teacherId !== undefined ? Number(b.teacherId) : undefined,
    dayOfWeek: b.dayOfWeek !== undefined ? Number(b.dayOfWeek) : undefined,
    startTime: b.startTime,
    endTime: b.endTime,
    room: b.room,
  };

  const mergedTeacher = payload.teacherId ?? Number(existing.teacher_id);
  await assertTeacherPayload(req, { teacherId: mergedTeacher });

  const updated = await svc.updateSchedule(id, payload);
  return sendSuccess(res, updated, "Program guncellendi.");
});

export const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "scheduleId");
  const existing = await svc.getScheduleById(id);
  await assertTeacherOwnsSchedule(req, existing);
  await svc.deleteSchedule(id);
  return sendSuccess(res, { deleted: true }, "Program silindi.");
});
