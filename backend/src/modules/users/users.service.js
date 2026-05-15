import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword } from "../../utils/password.js";

async function roleIdByName(name) {
  const r = await query(`SELECT id FROM roles WHERE name = $1`, [name]);
  return r.rows[0]?.id;
}

export async function listUsers(filters, pagination) {
  const conditions = ["1=1"];
  const params = [];
  let p = 1;

  if (filters.roleName) {
    conditions.push(`r.name = $${p++}`);
    params.push(filters.roleName);
  }
  if (filters.search) {
    conditions.push(
      `(LOWER(u.email) LIKE $${p} OR LOWER(u.first_name) LIKE $${p} OR LOWER(u.last_name) LIKE $${p})`,
    );
    params.push(`%${filters.search.toLowerCase()}%`);
    p++;
  }
  if (filters.isActive !== undefined) {
    conditions.push(`u.is_active = $${p++}`);
    params.push(filters.isActive);
  }

  const whereClause = conditions.join(" AND ");

  const countSql = `
    SELECT COUNT(*) AS total
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE ${whereClause}`;
  const countResult = await query(countSql, params);

  params.push(pagination.limit, pagination.offset);
  const listSql = `
    SELECT u.id, u.role_id, r.name AS role_name, u.first_name, u.last_name, u.email, u.phone,
           u.is_active, u.created_at, u.updated_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE ${whereClause}
    ORDER BY u.id ASC
    LIMIT $${p++} OFFSET $${p++}`;

  const rows = await query(listSql, params);

  return {
    items: rows.rows,
    total: Number(countResult.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getUserById(id, options = {}) {
  const sql = `
    SELECT u.id, u.role_id, r.name AS role_name, u.first_name, u.last_name, u.email, u.phone,
           u.is_active, u.created_at, u.updated_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1`;
  const result = await query(sql, [id]);
  const user = result.rows[0];
  if (!user && !options.allowMissing) {
    throw new AppError(404, "USER_NOT_FOUND", "Kullanici bulunamadi.");
  }
  return user ?? null;
}

export async function createUser(payload) {
  const roleId =
    (await roleIdByName(payload.roleName)) ?? (payload.roleId ? Number(payload.roleId) : null);
  if (!roleId) {
    throw new AppError(400, "USER_INVALID_ROLE", "roleName veya roleId gecerli degil.");
  }

  const passwordHash = await hashPassword(payload.password);

  try {
    const inserted = await query(
      `INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,true))
       RETURNING id`,
      [
        roleId,
        payload.firstName,
        payload.lastName,
        payload.email.trim().toLowerCase(),
        payload.phone ?? null,
        passwordHash,
        payload.isActive,
      ],
    );
    return getUserById(inserted.rows[0].id);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "USER_EMAIL_CONFLICT", "Bu email zaten kayitli.");
    }
    throw error;
  }
}

export async function updateUser(id, payload) {
  const fields = [];
  const params = [];
  let p = 1;

  if (payload.firstName !== undefined) {
    fields.push(`first_name = $${p++}`);
    params.push(payload.firstName);
  }
  if (payload.lastName !== undefined) {
    fields.push(`last_name = $${p++}`);
    params.push(payload.lastName);
  }
  if (payload.email !== undefined) {
    fields.push(`email = $${p++}`);
    params.push(payload.email.trim().toLowerCase());
  }
  if (payload.phone !== undefined) {
    fields.push(`phone = $${p++}`);
    params.push(payload.phone);
  }
  if (payload.isActive !== undefined) {
    fields.push(`is_active = $${p++}`);
    params.push(payload.isActive);
  }
  if (payload.roleName !== undefined) {
    const rid = await roleIdByName(payload.roleName);
    if (!rid) throw new AppError(400, "USER_INVALID_ROLE", "roleName gecersiz.");
    fields.push(`role_id = $${p++}`);
    params.push(rid);
  }
  if (payload.password !== undefined) {
    fields.push(`password_hash = $${p++}`);
    params.push(await hashPassword(payload.password));
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  params.push(id);
  try {
    const result = await query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${p} RETURNING id`,
      params,
    );
    if (result.rowCount === 0) {
      throw new AppError(404, "USER_NOT_FOUND", "Kullanici bulunamadi.");
    }
    return getUserById(id);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "USER_EMAIL_CONFLICT", "Bu email zaten kayitli.");
    }
    throw error;
  }
}

export async function deactivateUser(id) {
  const result = await query(`UPDATE users SET is_active = false WHERE id = $1 RETURNING id`, [id]);
  if (result.rowCount === 0) {
    throw new AppError(404, "USER_NOT_FOUND", "Kullanici bulunamadi.");
  }
  return { id, isActive: false };
}
