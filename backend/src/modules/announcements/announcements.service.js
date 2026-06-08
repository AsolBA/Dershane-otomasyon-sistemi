import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import * as notificationsSvc from "../notifications/notifications.service.js";

export async function listAnnouncements(filters, pagination) {
  const parts = ["1=1"];
  const params = [];
  let p = 1;

  if (filters.studentAnnouncementsEmpty) {
    parts.push(`1=0`);
  } else if (filters.parentAnnouncements) {
    parts.push(`(a.target_role_id IS NULL OR r.name = $${p++})`);
    params.push("parent");
  } else if (filters.studentAnnouncements) {
    parts.push(`(a.target_role_id IS NULL OR r.name = $${p++})`);
    params.push("student");

    const classId = filters.studentClassId;
    if (classId === null || classId === undefined) {
      parts.push(`a.class_id IS NULL`);
    } else {
      parts.push(`(a.class_id IS NULL OR a.class_id = $${p++})`);
      params.push(classId);
    }
  } else {
    const classId = filters.queryClassId;
    if (classId !== undefined && classId !== null && classId !== "") {
      parts.push(`(a.class_id IS NULL OR a.class_id = $${p++})`);
      params.push(classId);
    }

    const roleName = filters.queryRoleName;
    if (roleName) {
      parts.push(`(a.target_role_id IS NULL OR r.name = $${p})`);
      params.push(roleName);
      p++;
    }
  }

  const whereClause = parts.join(" AND ");

  const count = await query(
    `
    SELECT COUNT(*) AS total
    FROM announcements a
    LEFT JOIN roles r ON r.id = a.target_role_id
    WHERE ${whereClause}`,
    params,
  );

  const limitIdx = p;
  const offsetIdx = p + 1;
  const listParams = [...params, pagination.limit, pagination.offset];

  const rows = await query(
    `
    SELECT a.id, a.title, a.content, a.target_role_id, a.class_id, a.created_by, a.created_at, r.name AS target_role_name
    FROM announcements a
    LEFT JOIN roles r ON r.id = a.target_role_id
    WHERE ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    listParams,
  );

  return {
    items: rows.rows,
    total: Number(count.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getAnnouncementById(id) {
  const r = await query(`SELECT * FROM announcements WHERE id = $1`, [id]);
  if (!r.rows[0]) throw new AppError(404, "ANNOUNCEMENT_NOT_FOUND", "Duyuru bulunamadi.");
  return r.rows[0];
}

async function notifyUsersForAnnouncement(announcement) {
  let userRows = [];

  if (announcement.class_id) {
    const scoped = await query(
      `
      SELECT DISTINCT u.id
      FROM users u
      JOIN students s ON s.user_id = u.id
      WHERE s.current_class_id = $1 AND s.is_active = true
      UNION
      SELECT DISTINCT pu.id
      FROM parents p
      JOIN users pu ON pu.id = p.user_id
      JOIN students s ON s.parent_id = p.id
      WHERE s.current_class_id = $1 AND s.is_active = true`,
      [announcement.class_id],
    );
    userRows = scoped.rows;
  } else {
    const all = await query(`SELECT id FROM users WHERE is_active = true`);
    userRows = all.rows;
  }

  const message = announcement.title;
  for (const row of userRows) {
    await notificationsSvc.createNotification({
      userId: row.id,
      announcementId: announcement.id,
      title: "Yeni duyuru",
      message,
      isRead: false,
    });
  }
}

export async function createAnnouncement(payload) {
  let targetRoleId = payload.targetRoleId ?? null;
  if (payload.targetRoleName) {
    const roleRes = await query(`SELECT id FROM roles WHERE name = $1`, [payload.targetRoleName]);
    targetRoleId = roleRes.rows[0]?.id ?? null;
  }

  const inserted = await query(
    `
    INSERT INTO announcements (title, content, target_role_id, class_id, created_by)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [payload.title, payload.content, targetRoleId, payload.classId ?? null, payload.createdBy],
  );
  const announcement = inserted.rows[0];
  await notifyUsersForAnnouncement(announcement);
  return announcement;
}

export async function updateAnnouncement(id, payload) {
  await getAnnouncementById(id);
  const fields = [];
  const params = [];
  let pi = 1;

  let targetRoleId;
  if (payload.targetRoleName !== undefined) {
    if (payload.targetRoleName === null || payload.targetRoleName === "") {
      targetRoleId = null;
    } else {
      const roleRes = await query(`SELECT id FROM roles WHERE name = $1`, [payload.targetRoleName]);
      targetRoleId = roleRes.rows[0]?.id ?? null;
    }
    fields.push(`target_role_id = $${pi++}`);
    params.push(targetRoleId);
  } else if (payload.targetRoleId !== undefined) {
    fields.push(`target_role_id = $${pi++}`);
    params.push(payload.targetRoleId);
  }

  if (payload.title !== undefined) {
    fields.push(`title = $${pi++}`);
    params.push(payload.title);
  }
  if (payload.content !== undefined) {
    fields.push(`content = $${pi++}`);
    params.push(payload.content);
  }
  if (payload.classId !== undefined) {
    fields.push(`class_id = $${pi++}`);
    params.push(payload.classId);
  }

  if (fields.length === 0) return getAnnouncementById(id);

  params.push(id);
  const row = await query(`UPDATE announcements SET ${fields.join(", ")} WHERE id = $${pi} RETURNING *`, params);
  return row.rows[0];
}

export async function deleteAnnouncement(id) {
  const r = await query(`DELETE FROM announcements WHERE id = $1 RETURNING id`, [id]);
  if (r.rowCount === 0) throw new AppError(404, "ANNOUNCEMENT_NOT_FOUND", "Duyuru bulunamadi.");
}
