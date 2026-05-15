import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export async function listClasses(pagination, search) {
  const params = [];
  let p = 1;
  let where = "1=1";
  if (search) {
    where += ` AND LOWER(c.name) LIKE $${p++}`;
    params.push(`%${search.toLowerCase()}%`);
  }
  const count = await query(`SELECT COUNT(*) AS total FROM classes c WHERE ${where}`, params);
  params.push(pagination.limit, pagination.offset);
  const rows = await query(
    `
    SELECT c.id, c.name, c.level, c.advisor_teacher_id, c.created_at
    FROM classes c
    WHERE ${where}
    ORDER BY c.level, c.name
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

export async function getClassById(id) {
  const r = await query(`SELECT id, name, level, advisor_teacher_id, created_at FROM classes WHERE id = $1`, [id]);
  if (!r.rows[0]) throw new AppError(404, "CLASS_NOT_FOUND", "Sinif bulunamadi.");
  return r.rows[0];
}

export async function createClass(payload) {
  try {
    const r = await query(
      `INSERT INTO classes (name, level, advisor_teacher_id)
       VALUES ($1,$2,$3) RETURNING id`,
      [payload.name, payload.level, payload.advisorTeacherId ?? null],
    );
    return getClassById(r.rows[0].id);
  } catch (e) {
    if (e.code === "23505") throw new AppError(409, "CLASS_NAME_CONFLICT", "Sinif adi kullaniliyor.");
    throw e;
  }
}

export async function updateClass(id, payload) {
  const fields = [];
  const params = [];
  let p = 1;
  if (payload.name !== undefined) {
    fields.push(`name = $${p++}`);
    params.push(payload.name);
  }
  if (payload.level !== undefined) {
    fields.push(`level = $${p++}`);
    params.push(payload.level);
  }
  if (payload.advisorTeacherId !== undefined) {
    fields.push(`advisor_teacher_id = $${p++}`);
    params.push(payload.advisorTeacherId);
  }
  if (fields.length === 0) return getClassById(id);
  params.push(id);
  try {
    const r = await query(`UPDATE classes SET ${fields.join(", ")} WHERE id = $${p} RETURNING id`, params);
    if (r.rowCount === 0) throw new AppError(404, "CLASS_NOT_FOUND", "Sinif bulunamadi.");
    return getClassById(id);
  } catch (e) {
    if (e.code === "23505") throw new AppError(409, "CLASS_NAME_CONFLICT", "Sinif adi kullaniliyor.");
    throw e;
  }
}

export async function deleteClass(id) {
  const r = await query(`DELETE FROM classes WHERE id = $1 RETURNING id`, [id]);
  if (r.rowCount === 0) throw new AppError(404, "CLASS_NOT_FOUND", "Sinif bulunamadi.");
}

export async function listClassStudents(classId) {
  await getClassById(classId);
  const r = await query(
    `
    SELECT s.id AS student_id, s.student_no, u.first_name, u.last_name, cs.joined_at
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    JOIN users u ON u.id = s.user_id
    WHERE cs.class_id = $1
    ORDER BY u.last_name, u.first_name`,
    [classId],
  );
  return r.rows;
}
