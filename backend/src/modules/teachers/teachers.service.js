import { query, withTransaction } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword } from "../../utils/password.js";
import { DEFAULT_USER_PASSWORD } from "../../constants/default-password.js";
import { encryptLoginPassword } from "../../utils/login-password-storage.js";

export async function getTeacherIdByUserId(userId) {
  const r = await query(`SELECT id FROM teachers WHERE user_id = $1`, [userId]);
  return r.rows[0]?.id ?? null;
}

export async function listTeachers(pagination, search, { isActive } = {}) {
  const conditions = ["1=1"];
  const params = [];
  let p = 1;
  if (isActive !== undefined) {
    conditions.push(`u.is_active = $${p++}`);
    params.push(Boolean(isActive));
  }
  if (search) {
    conditions.push(
      `(LOWER(u.email) LIKE $${p} OR LOWER(u.first_name) LIKE $${p} OR LOWER(t.branch) LIKE $${p})`,
    );
    params.push(`%${search.toLowerCase()}%`);
    p++;
  }
  const whereClause = conditions.join(" AND ");
  const countRes = await query(
    `SELECT COUNT(*) AS total FROM teachers t JOIN users u ON u.id = t.user_id WHERE ${whereClause}`,
    params,
  );
  params.push(pagination.limit, pagination.offset);
  const rows = await query(
    `
    SELECT t.id, t.branch, t.user_id, u.first_name, u.last_name, u.email, u.phone, u.is_active,
           u.login_password_enc, u.must_change_password
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE ${whereClause}
    ORDER BY t.id ASC
    LIMIT $${p++} OFFSET $${p++}`,
    params,
  );
  return {
    items: rows.rows,
    total: Number(countRes.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getTeacherById(id) {
  const r = await query(
    `
    SELECT t.id, t.branch, t.user_id, u.first_name, u.last_name, u.email, u.phone, u.is_active,
           u.login_password_enc, u.must_change_password
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE t.id = $1`,
    [id],
  );
  if (!r.rows[0]) throw new AppError(404, "TEACHER_NOT_FOUND", "Ogretmen bulunamadi.");
  return r.rows[0];
}

export async function createTeacher(payload) {
  const pwd = payload.password ?? DEFAULT_USER_PASSWORD;
  const passwordHash = await hashPassword(pwd);
  const loginPasswordEnc = encryptLoginPassword(pwd);

  const teacherId = await withTransaction(async (client) => {
    const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'teacher'`);
    const roleId = roleRes.rows[0]?.id;
    if (!roleId) throw new AppError(500, "ROLE_TEACHER_MISSING", "teacher rolu bulunamadi.");

    let userRow;
    try {
      userRow = await client.query(
        `INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, is_active, must_change_password, login_password_enc)
         VALUES ($1,$2,$3,$4,$5,$6,true,true,$7) RETURNING id`,
        [
          roleId,
          payload.firstName,
          payload.lastName,
          payload.email.trim().toLowerCase(),
          payload.phone ?? null,
          passwordHash,
          loginPasswordEnc,
        ],
      );
    } catch (e) {
      if (e.code === "23505") throw new AppError(409, "USER_EMAIL_CONFLICT", "Bu email zaten kayitli.");
      throw e;
    }

    const userId = userRow.rows[0].id;
    const teacherRow = await client.query(
      `INSERT INTO teachers (user_id, branch) VALUES ($1,$2) RETURNING id`,
      [userId, payload.branch],
    );
    return teacherRow.rows[0].id;
  });

  return getTeacherById(teacherId);
}

export async function updateTeacher(id, payload) {
  const t = await query(`SELECT user_id FROM teachers WHERE id = $1`, [id]);
  if (!t.rows[0]) throw new AppError(404, "TEACHER_NOT_FOUND", "Ogretmen bulunamadi.");
  const userId = t.rows[0].user_id;

  if (
    payload.firstName ||
    payload.lastName ||
    payload.email ||
    payload.phone !== undefined ||
    payload.isActive !== undefined
  ) {
    const f = [];
    const pr = [];
    let i = 1;
    if (payload.firstName !== undefined) {
      f.push(`first_name = $${i++}`);
      pr.push(payload.firstName);
    }
    if (payload.lastName !== undefined) {
      f.push(`last_name = $${i++}`);
      pr.push(payload.lastName);
    }
    if (payload.email !== undefined) {
      f.push(`email = $${i++}`);
      pr.push(payload.email.trim().toLowerCase());
    }
    if (payload.phone !== undefined) {
      f.push(`phone = $${i++}`);
      pr.push(payload.phone);
    }
    if (payload.isActive !== undefined) {
      f.push(`is_active = $${i++}`);
      pr.push(Boolean(payload.isActive));
    }
    pr.push(userId);
    try {
      await query(`UPDATE users SET ${f.join(", ")} WHERE id = $${i}`, pr);
    } catch (e) {
      if (e.code === "23505") throw new AppError(409, "USER_EMAIL_CONFLICT", "Bu email zaten kayitli.");
      throw e;
    }
  }
  if (payload.branch !== undefined) {
    await query(`UPDATE teachers SET branch = $1 WHERE id = $2`, [payload.branch, id]);
  }
  return getTeacherById(id);
}

export async function assignCourse(teacherId, courseId) {
  await query(`INSERT INTO teacher_courses (teacher_id, course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [
    teacherId,
    courseId,
  ]);
}

export async function unassignCourse(teacherId, courseId) {
  await query(`DELETE FROM teacher_courses WHERE teacher_id = $1 AND course_id = $2`, [teacherId, courseId]);
}

export async function listTeacherCourses(teacherId) {
  const r = await query(
    `
    SELECT c.id, c.name, c.code
    FROM teacher_courses tc
    JOIN courses c ON c.id = tc.course_id
    WHERE tc.teacher_id = $1
    ORDER BY c.code`,
    [teacherId],
  );
  return r.rows;
}
