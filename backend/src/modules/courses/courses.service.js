import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export async function listCourses(pagination, search) {
  const params = [];
  let p = 1;
  let where = "1=1";
  if (search) {
    where += ` AND (LOWER(name) LIKE $${p} OR LOWER(code) LIKE $${p})`;
    params.push(`%${search.toLowerCase()}%`);
    p++;
  }
  const count = await query(`SELECT COUNT(*) AS total FROM courses WHERE ${where}`, params);
  params.push(pagination.limit, pagination.offset);
  const rows = await query(
    `
    SELECT id, name, code, description, created_at
    FROM courses
    WHERE ${where}
    ORDER BY code
    LIMIT $${p++} OFFSET $${p++}`,
    params,
  );
  return {
    items: rows.rows,
    total: Number(count.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getCourseById(id) {
  const r = await query(`SELECT id, name, code, description, created_at FROM courses WHERE id = $1`, [id]);
  if (!r.rows[0]) throw new AppError(404, "COURSE_NOT_FOUND", "Ders bulunamadi.");
  return r.rows[0];
}

export async function createCourse(payload) {
  try {
    const r = await query(
      `INSERT INTO courses (name, code, description) VALUES ($1,$2,$3) RETURNING id`,
      [payload.name, payload.code, payload.description ?? null],
    );
    return getCourseById(r.rows[0].id);
  } catch (e) {
    if (e.code === "23505") throw new AppError(409, "COURSE_CODE_OR_NAME_CONFLICT", "Ders adi veya kodu kullaniliyor.");
    throw e;
  }
}

export async function updateCourse(id, payload) {
  const fields = [];
  const params = [];
  let p = 1;
  if (payload.name !== undefined) {
    fields.push(`name = $${p++}`);
    params.push(payload.name);
  }
  if (payload.code !== undefined) {
    fields.push(`code = $${p++}`);
    params.push(payload.code);
  }
  if (payload.description !== undefined) {
    fields.push(`description = $${p++}`);
    params.push(payload.description);
  }
  if (fields.length === 0) return getCourseById(id);
  params.push(id);
  try {
    const r = await query(`UPDATE courses SET ${fields.join(", ")} WHERE id = $${p} RETURNING id`, params);
    if (r.rowCount === 0) throw new AppError(404, "COURSE_NOT_FOUND", "Ders bulunamadi.");
    return getCourseById(id);
  } catch (e) {
    if (e.code === "23505") throw new AppError(409, "COURSE_CODE_OR_NAME_CONFLICT", "Ders adi veya kodu kullaniliyor.");
    throw e;
  }
}

export async function deleteCourse(id) {
  const r = await query(`DELETE FROM courses WHERE id = $1 RETURNING id`, [id]);
  if (r.rowCount === 0) throw new AppError(404, "COURSE_NOT_FOUND", "Ders bulunamadi.");
}

export async function attachToClass(classId, courseId) {
  await query(`INSERT INTO class_courses (class_id, course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [
    classId,
    courseId,
  ]);
}

export async function detachFromClass(classId, courseId) {
  await query(`DELETE FROM class_courses WHERE class_id = $1 AND course_id = $2`, [classId, courseId]);
}

export async function listClassCourses(classId) {
  const r = await query(
    `
    SELECT c.id, c.name, c.code
    FROM class_courses cc
    JOIN courses c ON c.id = cc.course_id
    WHERE cc.class_id = $1
    ORDER BY c.code`,
    [classId],
  );
  return r.rows;
}
