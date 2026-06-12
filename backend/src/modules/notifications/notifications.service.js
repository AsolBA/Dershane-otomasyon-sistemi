import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export async function listMyNotifications(userId, pagination, onlyUnread = false) {
  const unreadClause = onlyUnread ? "AND n.is_read = false" : "";
  const params = [userId];
  const countSql = `SELECT COUNT(*) AS total FROM notifications n WHERE n.user_id = $1 ${unreadClause}`;
  const count = await query(countSql, params);

  const rows = await query(
    `
    SELECT n.*, pr.status AS reset_request_status
    FROM notifications n
    LEFT JOIN password_reset_requests pr
      ON n.notification_type = 'password_reset_request' AND pr.id = n.ref_id
    WHERE n.user_id = $1 ${unreadClause}
    ORDER BY n.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, pagination.limit, pagination.offset],
  );

  return {
    items: rows.rows,
    total: Number(count.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function createNotification(payload) {
  const r = await query(
    `
    INSERT INTO notifications (user_id, announcement_id, title, message, is_read, notification_type, ref_id)
    VALUES ($1,$2,$3,$4,COALESCE($5,false), COALESCE($6,'general'), $7)
    RETURNING *`,
    [
      payload.userId,
      payload.announcementId ?? null,
      payload.title,
      payload.message,
      payload.isRead,
      payload.notificationType ?? "general",
      payload.refId ?? null,
    ],
  );
  return r.rows[0];
}

export async function markRead(notificationId, userId) {
  const r = await query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1 AND user_id = $2
    RETURNING *`,
    [notificationId, userId],
  );
  if (!r.rows[0]) throw new AppError(404, "NOTIFICATION_NOT_FOUND", "Bildirim bulunamadi.");
  return r.rows[0];
}

export async function markAllRead(userId) {
  const r = await query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1 AND is_read = false
    RETURNING id`,
    [userId],
  );
  return { updatedCount: r.rowCount ?? 0 };
}

export async function deleteNotification(notificationId, userId) {
  const r = await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`, [
    notificationId,
    userId,
  ]);
  if (!r.rows[0]) {
    throw new AppError(404, "NOTIFICATION_NOT_FOUND", "Bildirim bulunamadi.");
  }
  return { deletedCount: 1 };
}

export async function deleteNotifications(userId, ids) {
  const numericIds = [...new Set((ids ?? []).map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))];
  if (!numericIds.length) {
    throw new AppError(400, "VALIDATION_ERROR", "Silinecek bildirim secilmedi.");
  }
  const r = await query(`DELETE FROM notifications WHERE user_id = $1 AND id = ANY($2::bigint[]) RETURNING id`, [
    userId,
    numericIds,
  ]);
  return { deletedCount: r.rowCount ?? 0 };
}
