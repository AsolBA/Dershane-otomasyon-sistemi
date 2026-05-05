import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export async function listMyNotifications(userId, pagination, onlyUnread = false) {
  const unreadClause = onlyUnread ? "AND n.is_read = false" : "";
  const params = [userId];
  const countSql = `SELECT COUNT(*) AS total FROM notifications n WHERE n.user_id = $1 ${unreadClause}`;
  const count = await query(countSql, params);

  const rows = await query(
    `
    SELECT *
    FROM notifications n
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
    INSERT INTO notifications (user_id, announcement_id, title, message, is_read)
    VALUES ($1,$2,$3,$4,COALESCE($5,false))
    RETURNING *`,
    [
      payload.userId,
      payload.announcementId ?? null,
      payload.title,
      payload.message,
      payload.isRead,
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
