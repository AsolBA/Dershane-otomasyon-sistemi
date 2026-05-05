import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { getTeacherIdByUserId } from "../teachers/teachers.service.js";

export async function assertScheduleOwnedByTeacher(req, scheduleId) {
  if (!["teacher"].includes(req.user.role)) return;
  const tid = await getTeacherIdByUserId(req.user.id);
  const s = await query(`SELECT teacher_id FROM schedules WHERE id = $1`, [scheduleId]);
  if (!s.rows[0] || Number(s.rows[0].teacher_id) !== Number(tid)) {
    throw new AppError(403, "AUTH_FORBIDDEN", "Bu ders icin yoklama alamazsiniz.");
  }
}

export async function assertAttendanceOwnedByTeacher(req, attendanceId) {
  if (!["teacher"].includes(req.user.role)) return;
  const tid = await getTeacherIdByUserId(req.user.id);
  const r = await query(
    `
    SELECT sc.teacher_id
    FROM attendance a
    JOIN schedules sc ON sc.id = a.schedule_id
    WHERE a.id = $1`,
    [attendanceId],
  );
  if (!r.rows[0] || Number(r.rows[0].teacher_id) !== Number(tid)) {
    throw new AppError(403, "AUTH_FORBIDDEN", "Bu yoklamayi guncelleyemezsiniz.");
  }
}

export async function listAttendance(filters, pagination) {
  const parts = [`1=1`];
  const params = [];
  let p = 1;

  if (filters.studentId) {
    parts.push(`a.student_id = $${p++}`);
    params.push(filters.studentId);
  }
  if (filters.scheduleId) {
    parts.push(`a.schedule_id = $${p++}`);
    params.push(filters.scheduleId);
  }
  if (filters.classId) {
    parts.push(`sc.class_id = $${p++}`);
    params.push(filters.classId);
  }
  if (filters.fromDate) {
    parts.push(`a.attendance_date >= $${p++}`);
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    parts.push(`a.attendance_date <= $${p++}`);
    params.push(filters.toDate);
  }
  if (filters.status) {
    parts.push(`a.status = $${p++}`);
    params.push(filters.status);
  }
  if (filters.teacherId) {
    parts.push(`sc.teacher_id = $${p++}`);
    params.push(filters.teacherId);
  }

  const whereClause = parts.join(" AND ");

  const countResult = await query(
    `
    SELECT COUNT(*) AS total
    FROM attendance a
    JOIN schedules sc ON sc.id = a.schedule_id
    WHERE ${whereClause}`,
    params,
  );

  const limitIdx = p;
  const offsetIdx = p + 1;
  const listParams = [...params, pagination.limit, pagination.offset];

  const rows = await query(
    `
    SELECT a.id, a.student_id, a.schedule_id, a.attendance_date, a.status, a.note, a.marked_by, a.created_at,
           sc.class_id, sc.course_id, sc.teacher_id
    FROM attendance a
    JOIN schedules sc ON sc.id = a.schedule_id
    WHERE ${whereClause}
    ORDER BY a.attendance_date DESC, a.id DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    listParams,
  );

  return {
    items: rows.rows,
    total: Number(countResult.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getAttendanceById(id) {
  const r = await query(
    `
    SELECT a.*
    FROM attendance a
    WHERE a.id = $1`,
    [id],
  );
  if (!r.rows[0]) throw new AppError(404, "ATTENDANCE_NOT_FOUND", "Yoklama kaydi bulunamadi.");
  return r.rows[0];
}

export async function upsertAttendance(payload, markedByUserId) {
  try {
    const r = await query(
      `
      INSERT INTO attendance (student_id, schedule_id, attendance_date, status, note, marked_by)
      VALUES ($1,$2,$3::date,$4,$5,$6)
      ON CONFLICT (student_id, schedule_id, attendance_date)
      DO UPDATE SET status = EXCLUDED.status, note = COALESCE(EXCLUDED.note, attendance.note),
                    marked_by = EXCLUDED.marked_by
      RETURNING *`,
      [
        payload.studentId,
        payload.scheduleId,
        payload.attendanceDate,
        payload.status,
        payload.note ?? null,
        markedByUserId ?? null,
      ],
    );
    return r.rows[0];
  } catch (e) {
    if (e.code === "23514") throw new AppError(400, "ATTENDANCE_INVALID_STATUS", "Gecersiz yoklama durumu.");
    throw e;
  }
}

export async function updateAttendance(id, payload) {
  await getAttendanceById(id);

  const fields = [];
  const params = [];
  let pi = 1;
  if (payload.status !== undefined) {
    fields.push(`status = $${pi++}`);
    params.push(payload.status);
  }
  if (payload.note !== undefined) {
    fields.push(`note = $${pi++}`);
    params.push(payload.note);
  }
  if (payload.markedBy !== undefined) {
    fields.push(`marked_by = $${pi++}`);
    params.push(payload.markedBy);
  }
  if (fields.length === 0) return getAttendanceById(id);

  params.push(id);
  const r = await query(`UPDATE attendance SET ${fields.join(", ")} WHERE id = $${pi} RETURNING *`, params);
  return r.rows[0];
}

export async function attendanceReport(filters) {
  const parts = [`1=1`];
  const params = [];
  let p = 1;
  if (filters.classId) {
    parts.push(`sc.class_id = $${p++}`);
    params.push(filters.classId);
  }
  if (filters.teacherId) {
    parts.push(`sc.teacher_id = $${p++}`);
    params.push(filters.teacherId);
  }
  if (filters.fromDate) {
    parts.push(`a.attendance_date >= $${p++}`);
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    parts.push(`a.attendance_date <= $${p++}`);
    params.push(filters.toDate);
  }
  const whereClause = parts.join(" AND ");

  const rows = await query(
    `
    SELECT
      a.student_id,
      COUNT(*) FILTER (WHERE a.status = 'present')::int AS present_count,
      COUNT(*) FILTER (WHERE a.status = 'absent')::int AS absent_count,
      COUNT(*) FILTER (WHERE a.status = 'late')::int AS late_count,
      COUNT(*) FILTER (WHERE a.status = 'excused')::int AS excused_count,
      COUNT(*)::int AS total_marked
    FROM attendance a
    JOIN schedules sc ON sc.id = a.schedule_id
    WHERE ${whereClause}
    GROUP BY a.student_id
    ORDER BY a.student_id`,
    params,
  );

  const summary = rows.rows.reduce(
    (acc, row) => ({
      totalStudents: acc.totalStudents + 1,
      presentCount: acc.presentCount + row.present_count,
      absentCount: acc.absentCount + row.absent_count,
      lateCount: acc.lateCount + row.late_count,
      excusedCount: acc.excusedCount + row.excused_count,
      totalMarked: acc.totalMarked + row.total_marked,
    }),
    {
      totalStudents: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      totalMarked: 0,
    },
  );

  return { filters, summary, perStudent: rows.rows };
}
