// =============================================================================
// modules/students/students.service.js — Ogrenci is mantigi + SQL
// Liste/filtreleme, createStudent (users + students transaction), guncelleme burada.
// Diger moduller (teachers, classes...) ayni controller/service/routes yapisini kullanir.
// =============================================================================
import { query, withTransaction } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword } from "../../utils/password.js";
import { DEFAULT_USER_PASSWORD } from "../../constants/default-password.js";
import { encryptLoginPassword } from "../../utils/login-password-storage.js";

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
           u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.must_change_password, u.login_password_enc,
           r.name AS role_name,
           pu.first_name AS parent_first_name, pu.last_name AS parent_last_name,
           pu.phone AS parent_phone, pu.email AS parent_email,
           pu.login_password_enc AS parent_login_password_enc
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN parents p ON p.id = s.parent_id
    LEFT JOIN users pu ON pu.id = p.user_id
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
           u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.must_change_password, u.login_password_enc,
           pu.first_name AS parent_first_name, pu.last_name AS parent_last_name,
           pu.phone AS parent_phone, pu.email AS parent_email,
           pu.login_password_enc AS parent_login_password_enc
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN parents p ON p.id = s.parent_id
    LEFT JOIN users pu ON pu.id = p.user_id
    WHERE s.id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) {
    throw new AppError(404, "STUDENT_NOT_FOUND", "Ogrenci bulunamadi.");
  }
  return row;
}

function buildParentLoginEmail(firstName, lastName) {
  const turkishToAscii = (value) =>
    String(value || "")
      .replace(/ç/g, "c")
      .replace(/Ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/I/g, "i")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "u")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  const local = `${turkishToAscii(firstName)}${turkishToAscii(lastName)}`;
  if (!local) return "";
  return `${local}.parent@dershane.local`;
}

async function findOrCreateParent(runQuery, { firstName, lastName, email, phone, passwordHash, plainPassword }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return null;

  const existing = await runQuery(
    `
    SELECT p.id
    FROM parents p
    JOIN users u ON u.id = p.user_id
    WHERE LOWER(u.email) = $1`,
    [normalizedEmail],
  );
  if (existing.rows[0]) {
    const parentId = existing.rows[0].id;
    await updateParentUserProfile(runQuery, parentId, { firstName, lastName, phone });
    return parentId;
  }

  const parentRoleRes = await runQuery(`SELECT id FROM roles WHERE name = 'parent'`);
  const parentRoleId = parentRoleRes.rows[0]?.id;
  if (!parentRoleId) {
    throw new AppError(500, "ROLE_PARENT_MISSING", "parent rolu bulunamadi.");
  }

  let parentUser;
  try {
    parentUser = await runQuery(
      `INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, is_active, must_change_password, login_password_enc)
       VALUES ($1,$2,$3,$4,$5,$6,true,true,$7)
       RETURNING id`,
      [parentRoleId, firstName, lastName, normalizedEmail, phone ?? null, passwordHash, encryptLoginPassword(plainPassword ?? DEFAULT_USER_PASSWORD)],
    );
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "USER_EMAIL_CONFLICT", "Veli e-postasi zaten kayitli.");
    }
    throw error;
  }

  const parentRow = await runQuery(`INSERT INTO parents (user_id) VALUES ($1) RETURNING id`, [
    parentUser.rows[0].id,
  ]);
  return parentRow.rows[0].id;
}

async function updateParentUserProfile(runQuery, parentId, { firstName, lastName, phone }) {
  const fields = [];
  const params = [];
  let p = 1;
  if (firstName !== undefined && firstName !== null) {
    fields.push(`first_name = $${p++}`);
    params.push(firstName);
  }
  if (lastName !== undefined && lastName !== null) {
    fields.push(`last_name = $${p++}`);
    params.push(lastName);
  }
  if (phone !== undefined) {
    fields.push(`phone = $${p++}`);
    params.push(phone);
  }
  if (!fields.length) return;
  params.push(parentId);
  await runQuery(
    `UPDATE users SET ${fields.join(", ")} WHERE id = (SELECT user_id FROM parents WHERE id = $${p})`,
    params,
  );
}

function resolveParentNames(payload) {
  const firstName = String(payload.parentFirstName ?? "").trim();
  const lastName = String(payload.parentLastName ?? "").trim() || "-";
  return { firstName: firstName || "Veli", lastName };
}

export async function createStudent(payload) {
  const pwd = payload.password ?? DEFAULT_USER_PASSWORD;
  const passwordHash = await hashPassword(pwd);
  const loginPasswordEnc = encryptLoginPassword(pwd);

  const studentId = await withTransaction(async (client) => {
    const studentRoleRes = await client.query(`SELECT id FROM roles WHERE name = 'student'`);
    const studentRoleId = studentRoleRes.rows[0]?.id;
    if (!studentRoleId) {
      throw new AppError(500, "ROLE_STUDENT_MISSING", "student rolu bulunamadi.");
    }

    let parentId = payload.parentId ?? null;
    const parentEmail =
      payload.parentEmail || buildParentLoginEmail(payload.firstName, payload.lastName);
    if (parentEmail && (payload.parentPhone || payload.parentEmail)) {
      const parentNames = resolveParentNames(payload);
      parentId = await findOrCreateParent((sql, params) => client.query(sql, params), {
        firstName: parentNames.firstName,
        lastName: parentNames.lastName,
        email: parentEmail,
        phone: payload.parentPhone ?? null,
        passwordHash,
        plainPassword: pwd,
      });
    }

    let insertedUser;
    try {
      insertedUser = await client.query(
        `INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, is_active, must_change_password, login_password_enc)
         VALUES ($1,$2,$3,$4,$5,$6,true,true,$7)
         RETURNING id`,
        [
          studentRoleId,
          payload.firstName,
          payload.lastName,
          payload.email.trim().toLowerCase(),
          payload.phone ?? null,
          passwordHash,
          loginPasswordEnc,
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
          parentId,
          payload.enrollmentDate ?? null,
          payload.isActive,
        ],
      );
      return insertedStudent.rows[0].id;
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError(409, "STUDENT_NO_CONFLICT", "Ogrenci numarasi zaten kullaniliyor.");
      }
      throw error;
    }
  });

  return getStudentById(studentId);
}

export async function updateStudent(id, payload) {
  const studentRes = await query(
    `
    SELECT s.user_id, s.parent_id, u.first_name, u.last_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = $1`,
    [id],
  );
  if (studentRes.rowCount === 0) {
    throw new AppError(404, "STUDENT_NOT_FOUND", "Ogrenci bulunamadi.");
  }
  const studentRow = studentRes.rows[0];
  const userId = studentRow.user_id;
  let parentId = studentRow.parent_id ?? null;

  const firstName = payload.firstName ?? studentRow.first_name;
  const lastName = payload.lastName ?? studentRow.last_name;
  const parentEmail = payload.parentEmail || buildParentLoginEmail(firstName, lastName);

  if ((payload.parentPhone !== undefined || payload.parentEmail) && !parentId && parentEmail) {
    const parentPwd = payload.password ?? DEFAULT_USER_PASSWORD;
    const passwordHash = await hashPassword(parentPwd);
    const parentNames = resolveParentNames(payload);
    parentId = await findOrCreateParent((sql, params) => query(sql, params), {
      firstName: parentNames.firstName,
      lastName: parentNames.lastName,
      email: parentEmail,
      phone: payload.parentPhone ?? null,
      passwordHash,
      plainPassword: parentPwd,
    });
  }

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
  } else if (parentId != null) {
    sFields.push(`parent_id = $${sp++}`);
    sParams.push(parentId);
  }
  if (
    parentId &&
    (payload.parentPhone !== undefined ||
      payload.parentFirstName !== undefined ||
      payload.parentLastName !== undefined)
  ) {
    const parentNames =
      payload.parentFirstName !== undefined || payload.parentLastName !== undefined
        ? resolveParentNames(payload)
        : {};
    await updateParentUserProfile((sql, params) => query(sql, params), parentId, {
      firstName: parentNames.firstName,
      lastName: parentNames.lastName,
      phone: payload.parentPhone !== undefined ? payload.parentPhone || null : undefined,
    });
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

export async function deleteStudent(id) {
  const student = await getStudentById(id);
  const userId = Number(student.user_id);
  const parentId = student.parent_id != null ? Number(student.parent_id) : null;

  await withTransaction(async (client) => {
    let parentUserId = null;

    if (parentId) {
      const siblings = await client.query(
        `SELECT COUNT(*)::int AS count FROM students WHERE parent_id = $1 AND id <> $2`,
        [parentId, id],
      );
      if (siblings.rows[0]?.count === 0) {
        const parentRes = await client.query(`SELECT user_id FROM parents WHERE id = $1`, [parentId]);
        parentUserId = parentRes.rows[0]?.user_id ?? null;
      }
    }

    const deletedStudentUser = await client.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [userId]);
    if (deletedStudentUser.rowCount === 0) {
      throw new AppError(404, "STUDENT_NOT_FOUND", "Ogrenci kullanicisi bulunamadi.");
    }

    if (parentUserId) {
      await client.query(`DELETE FROM users WHERE id = $1`, [parentUserId]);
    }
  });

  return { deleted: true, id };
}
