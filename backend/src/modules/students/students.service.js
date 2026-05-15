import { query, withTransaction } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword } from "../../utils/password.js";

export async function getParentIdByUserId(userId) {
  const r = await query(`SELECT id FROM parents WHERE user_id = $1`, [userId]);
  return r.rows[0]?.id ?? null;
}

export async function getStudentIdByUserId(userId) {
  const r = await query(`SELECT id FROM students WHERE user_id = $1`, [userId]);
  return r.rows[0]?.id ?? null;
}

export async function listStudents(filters, pagination) {
  const conditions = ["1=1"];
  const params = [];
  let p = 1;

  if (filters.classId) {
    conditions.push(`s.current_class_id = $${p++}`);
    params.push(filters.classId);
  }
  if (filters.parentId) {
    conditions.push(`s.parent_id = $${p++}`);
    params.push(filters.parentId);
  }
  if (filters.userId) {
    conditions.push(`s.user_id = $${p++}`);
    params.push(filters.userId);
  }
  if (filters.studentNo) {
    conditions.push(`s.student_no ILIKE $${p++}`);
    params.push(`%${filters.studentNo}%`);
  }
  if (filters.isActive !== undefined) {
    conditions.push(`s.is_active = $${p++}`);
    params.push(filters.isActive);
  }
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      `(LOWER(u.email) LIKE $${p} OR LOWER(u.first_name) LIKE $${p} OR LOWER(u.last_name) LIKE $${p})`,
    );
    params.push(term);
    p++;
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await query(
    `
    SELECT COUNT(*) AS total
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE ${whereClause}`,
    params,
  );

  params.push(pagination.limit, pagination.offset);

  const listSql = `
    SELECT s.id, s.student_no, s.enrollment_date, s.is_active, s.current_class_id, s.parent_id,
           u.id AS user_id, u.first_name, u.last_name, u.email, u.phone,
           r.name AS role_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN roles r ON r.id = u.role_id
    WHERE ${whereClause}
    ORDER BY s.id ASC
    LIMIT $${p++} OFFSET $${p++}`;

  const rows = await query(listSql, params);

  return {
    items: rows.rows,
    total: Number(countResult.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getStudentById(id) {
  const result = await query(
    `
    SELECT s.id, s.student_no, s.enrollment_date, s.is_active, s.current_class_id, s.parent_id,
           u.id AS user_id, u.first_name, u.last_name, u.email, u.phone
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) {
    throw new AppError(404, "STUDENT_NOT_FOUND", "Ogrenci bulunamadi.");
  }
  return row;
}

export async function createStudent(payload) {
  const pwd = payload.password ?? "ChangeMe123!";
  const passwordHash = await hashPassword(pwd);

  return withTransaction(async (client) => {
    const studentRoleRes = await client.query(`SELECT id FROM roles WHERE name = 'student'`);
    const studentRoleId = studentRoleRes.rows[0]?.id;
    if (!studentRoleId) {
      throw new AppError(500, "ROLE_STUDENT_MISSING", "student rolu bulunamadi.");
    }

    let insertedUser;
    try {
      insertedUser = await client.query(
        `INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,true)
         RETURNING id`,
        [
          studentRoleId,
          payload.firstName,
          payload.lastName,
          payload.email.trim().toLowerCase(),
          payload.phone ?? null,
          passwordHash,
        ],
      );
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError(409, "USER_EMAIL_CONFLICT", "Bu email zaten kayitli.");
      }
      throw error;
    }

    const userId = insertedUser.rows[0].id;

    try {
      const insertedStudent = await client.query(
        `INSERT INTO students (user_id, student_no, current_class_id, parent_id, enrollment_date, is_active)
         VALUES ($1,$2,$3,$4, COALESCE($5::date, CURRENT_DATE), COALESCE($6,true))
         RETURNING id`,
        [
          userId,
          payload.studentNo,
          payload.currentClassId ?? null,
          payload.parentId ?? null,
          payload.enrollmentDate ?? null,
          payload.isActive,
        ],
      );
      const studentId = insertedStudent.rows[0].id;
      return getStudentById(studentId);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError(409, "STUDENT_NO_CONFLICT", "Ogrenci numarasi zaten kullaniliyor.");
      }
      throw error;
    }
  });
}

export async function updateStudent(id, payload) {
  const studentRes = await query(`SELECT user_id FROM students WHERE id = $1`, [id]);
  if (studentRes.rowCount === 0) {
    throw new AppError(404, "STUDENT_NOT_FOUND", "Ogrenci bulunamadi.");
  }
  const userId = studentRes.rows[0].user_id;

  if (payload.firstName !== undefined || payload.lastName !== undefined || payload.email !== undefined || payload.phone !== undefined) {
    const uFields = [];
    const uParams = [];
    let p = 1;
    if (payload.firstName !== undefined) {
      uFields.push(`first_name = $${p++}`);
      uParams.push(payload.firstName);
    }
    if (payload.lastName !== undefined) {
      uFields.push(`last_name = $${p++}`);
      uParams.push(payload.lastName);
    }
    if (payload.email !== undefined) {
      uFields.push(`email = $${p++}`);
      uParams.push(payload.email.trim().toLowerCase());
    }
    if (payload.phone !== undefined) {
      uFields.push(`phone = $${p++}`);
      uParams.push(payload.phone);
    }
    uParams.push(userId);
    try {
      await query(`UPDATE users SET ${uFields.join(", ")} WHERE id = $${p}`, uParams);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError(409, "USER_EMAIL_CONFLICT", "Bu email zaten kayitli.");
      }
      throw error;
    }
  }

  const sFields = [];
  const sParams = [];
  let sp = 1;
  if (payload.studentNo !== undefined) {
    sFields.push(`student_no = $${sp++}`);
    sParams.push(payload.studentNo);
  }
  if (payload.currentClassId !== undefined) {
    sFields.push(`current_class_id = $${sp++}`);
    sParams.push(payload.currentClassId);
  }
  if (payload.parentId !== undefined) {
    sFields.push(`parent_id = $${sp++}`);
    sParams.push(payload.parentId);
  }
  if (payload.enrollmentDate !== undefined) {
    sFields.push(`enrollment_date = $${sp++}`);
    sParams.push(payload.enrollmentDate);
  }
  if (payload.isActive !== undefined) {
    sFields.push(`is_active = $${sp++}`);
    sParams.push(payload.isActive);
  }

  if (sFields.length > 0) {
    sParams.push(id);
    try {
      await query(`UPDATE students SET ${sFields.join(", ")} WHERE id = $${sp}`, sParams);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError(409, "STUDENT_NO_CONFLICT", "Ogrenci numarasi zaten kullaniliyor.");
      }
      throw error;
    }
  }

  return getStudentById(id);
}

export async function addStudentToClass(classId, studentId) {
  await query(`INSERT INTO class_students (class_id, student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [
    classId,
    studentId,
  ]);
  return { classId, studentId };
}

export async function removeStudentFromClass(classId, studentId) {
  await query(`DELETE FROM class_students WHERE class_id = $1 AND student_id = $2`, [classId, studentId]);
  return { classId, studentId };
}
