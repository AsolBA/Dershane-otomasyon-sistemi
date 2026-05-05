import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

async function findTeacherOverlaps({ teacherId, dayOfWeek, startTime, endTime }, excludeId) {
  const params = [teacherId, dayOfWeek, startTime, endTime];
  let sql = `
    SELECT id, teacher_id, class_id, day_of_week, start_time, end_time, room
    FROM schedules
    WHERE teacher_id = $1 AND day_of_week = $2
      AND ($3::time < end_time AND $4::time > start_time)`;
  if (excludeId) {
    sql += ` AND id <> $5`;
    params.push(excludeId);
  }
  return query(sql, params);
}

async function findClassOverlaps({ classId, dayOfWeek, startTime, endTime }, excludeId) {
  const params = [classId, dayOfWeek, startTime, endTime];
  let sql = `
    SELECT id, teacher_id, class_id, day_of_week, start_time, end_time, room
    FROM schedules
    WHERE class_id = $1 AND day_of_week = $2
      AND ($3::time < end_time AND $4::time > start_time)`;
  if (excludeId) {
    sql += ` AND id <> $5`;
    params.push(excludeId);
  }
  return query(sql, params);
}

export async function assertNoScheduleConflict(payload, excludeScheduleId = null) {
  const [teacherOverlaps, classOverlaps] = await Promise.all([
    findTeacherOverlaps(payload, excludeScheduleId),
    findClassOverlaps(payload, excludeScheduleId),
  ]);
  const conflicts = [
    ...teacherOverlaps.rows.map((row) => ({ type: "teacher_overlap", scheduleId: row.id, schedule: row })),
    ...classOverlaps.rows.map((row) => ({ type: "class_overlap", scheduleId: row.id, schedule: row })),
  ];
  if (conflicts.length > 0) {
    throw new AppError(409, "SCHEDULE_CONFLICT", "Ders programi cakisiyor.", conflicts);
  }
}

export async function listSchedules(filters, pagination) {
  const parts = [`1=1`];
  const params = [];
  let p = 1;
  if (filters.classId) {
    parts.push(`class_id = $${p++}`);
    params.push(filters.classId);
  }
  if (filters.teacherId) {
    parts.push(`teacher_id = $${p++}`);
    params.push(filters.teacherId);
  }
  if (filters.courseId) {
    parts.push(`course_id = $${p++}`);
    params.push(filters.courseId);
  }
  if (filters.dayOfWeek) {
    parts.push(`day_of_week = $${p++}`);
    params.push(filters.dayOfWeek);
  }
  const whereClause = parts.join(" AND ");

  const countResult = await query(`SELECT COUNT(*) AS total FROM schedules WHERE ${whereClause}`, params);
  params.push(pagination.limit, pagination.offset);

  const listSql = `
    SELECT *
    FROM schedules
    WHERE ${whereClause}
    ORDER BY day_of_week, start_time
    LIMIT $${p++} OFFSET $${p++}`;
  const rows = await query(listSql, params);

  return {
    items: rows.rows,
    total: Number(countResult.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getScheduleById(id) {
  const r = await query(`SELECT * FROM schedules WHERE id = $1`, [id]);
  if (!r.rows[0]) throw new AppError(404, "SCHEDULE_NOT_FOUND", "Program kaydi bulunamadi.");
  return r.rows[0];
}

export async function createSchedule(payload) {
  await assertNoScheduleConflict(payload);

  try {
    const r = await query(
      `
      INSERT INTO schedules (class_id, course_id, teacher_id, day_of_week, start_time, end_time, room)
      VALUES ($1,$2,$3,$4,$5::time,$6::time,$7)
      RETURNING *`,
      [
        payload.classId,
        payload.courseId,
        payload.teacherId,
        payload.dayOfWeek,
        payload.startTime,
        payload.endTime,
        payload.room ?? null,
      ],
    );
    return r.rows[0];
  } catch (e) {
    if (e.code === "23514") throw new AppError(400, "VALIDATION_ERROR", "Baslangic zamani bitis zamani olarak esit veya buyuk.");
    throw e;
  }
}

export async function updateSchedule(id, payload) {
  const current = await getScheduleById(id);
  const next = {
    classId: payload.classId ?? current.class_id,
    courseId: payload.courseId ?? current.course_id,
    teacherId: payload.teacherId ?? current.teacher_id,
    dayOfWeek: payload.dayOfWeek ?? current.day_of_week,
    startTime: (payload.startTime ?? current.start_time).toString?.() ?? `${current.start_time}`,
    endTime: (payload.endTime ?? current.end_time).toString?.() ?? `${current.end_time}`,
    room: payload.room !== undefined ? payload.room : current.room,
  };

  await assertNoScheduleConflict(
    {
      classId: Number(next.classId),
      teacherId: Number(next.teacherId),
      courseId: Number(next.courseId),
      dayOfWeek: Number(next.dayOfWeek),
      startTime: next.startTime,
      endTime: next.endTime,
    },
    id,
  );

  const r = await query(
    `
    UPDATE schedules
    SET class_id = $1, course_id = $2, teacher_id = $3, day_of_week = $4,
        start_time = $5::time, end_time = $6::time, room = $7
    WHERE id = $8
    RETURNING *`,
    [
      next.classId,
      next.courseId,
      next.teacherId,
      next.dayOfWeek,
      next.startTime,
      next.endTime,
      next.room,
      id,
    ],
  );
  return r.rows[0];
}

export async function deleteSchedule(id) {
  const r = await query(`DELETE FROM schedules WHERE id = $1 RETURNING id`, [id]);
  if (r.rowCount === 0) throw new AppError(404, "SCHEDULE_NOT_FOUND", "Program kaydi bulunamadi.");
}
