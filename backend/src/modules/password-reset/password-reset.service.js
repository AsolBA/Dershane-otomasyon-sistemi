import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword } from "../../utils/password.js";
import { DEFAULT_USER_PASSWORD } from "../../constants/default-password.js";
import { encryptLoginPassword } from "../../utils/login-password-storage.js";
import * as notificationsSvc from "../notifications/notifications.service.js";

const RESETTABLE_ROLES = ["student", "parent", "teacher"];

async function findUserByEmail(email) {
  const result = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email],
  );
  return result.rows[0] ?? null;
}

async function listAdminUserIds() {
  const result = await query(
    `SELECT u.id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.name IN ('admin', 'manager') AND u.is_active = true`,
  );
  return result.rows.map((row) => row.id);
}

async function applyDefaultPasswordReset(userId) {
  const passwordHash = await hashPassword(DEFAULT_USER_PASSWORD);
  const loginPasswordEnc = encryptLoginPassword(DEFAULT_USER_PASSWORD);
  await query(
    `UPDATE users
     SET password_hash = $1,
         login_password_enc = $2,
         must_change_password = true,
         updated_at = NOW()
     WHERE id = $3`,
    [passwordHash, loginPasswordEnc, userId],
  );
}

export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new AppError(400, "VALIDATION_ERROR", "E-posta zorunludur.");
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user || !user.is_active || !RESETTABLE_ROLES.includes(user.role_name)) {
    return { submitted: true };
  }

  const pending = await query(
    `SELECT id FROM password_reset_requests WHERE user_id = $1 AND status = 'pending' LIMIT 1`,
    [user.id],
  );
  if (pending.rows[0]) {
    return { submitted: true };
  }

  const inserted = await query(
    `INSERT INTO password_reset_requests (user_id, status) VALUES ($1, 'pending') RETURNING id`,
    [user.id],
  );
  const requestId = inserted.rows[0].id;
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  const adminIds = await listAdminUserIds();
  const title = "Şifre sıfırlama talebi";
  const message = `${fullName} (${user.email}) şifresini unuttu. Onaylarsanız varsayılan şifre atanır.`;

  for (const adminId of adminIds) {
    await notificationsSvc.createNotification({
      userId: adminId,
      title,
      message,
      notificationType: "password_reset_request",
      refId: requestId,
    });
  }

  return { submitted: true };
}

async function getRequestById(id) {
  const result = await query(
    `SELECT pr.*, u.email, u.first_name, u.last_name, r.name AS role_name
     FROM password_reset_requests pr
     JOIN users u ON u.id = pr.user_id
     JOIN roles r ON r.id = u.role_id
     WHERE pr.id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) {
    throw new AppError(404, "PASSWORD_RESET_NOT_FOUND", "Sifre sifirlama talebi bulunamadi.");
  }
  return row;
}

async function finalizeAdminResetNotifications(requestId, status, fullName, email) {
  const approved = status === "approved";
  const title = approved ? "Şifre sıfırlama talebi onaylandı" : "Şifre sıfırlama talebi reddedildi";
  const message = approved
    ? `${fullName} (${email}) için talep onaylandı. Varsayılan şifre atandı.`
    : `${fullName} (${email}) için talep reddedildi.`;

  await query(
    `UPDATE notifications
     SET title = $1, message = $2, notification_type = $3, is_read = true
     WHERE notification_type = 'password_reset_request' AND ref_id = $4`,
    [title, message, approved ? "password_reset_approved" : "password_reset_rejected", requestId],
  );
}

export async function approvePasswordReset(requestId, adminUserId) {
  const request = await getRequestById(requestId);
  if (request.status !== "pending") {
    throw new AppError(400, "PASSWORD_RESET_ALREADY_RESOLVED", "Talep zaten sonuclandirilmis.");
  }

  const fullName = `${request.first_name || ""} ${request.last_name || ""}`.trim() || request.email;

  await applyDefaultPasswordReset(request.user_id);

  await query(
    `UPDATE password_reset_requests
     SET status = 'approved', resolved_at = NOW(), resolved_by = $2
     WHERE id = $1`,
    [requestId, adminUserId],
  );

  await finalizeAdminResetNotifications(requestId, "approved", fullName, request.email);

  await notificationsSvc.createNotification({
    userId: request.user_id,
    title: "Şifreniz sıfırlandı",
    message: `Yönetici talebinizi onayladı. ${DEFAULT_USER_PASSWORD} ile giriş yapın; ardından yeni şifre belirlemeniz istenecek.`,
    notificationType: "general",
  });

  return { approved: true, userId: request.user_id, email: request.email };
}

export async function rejectPasswordReset(requestId, adminUserId) {
  const request = await getRequestById(requestId);
  if (request.status !== "pending") {
    throw new AppError(400, "PASSWORD_RESET_ALREADY_RESOLVED", "Talep zaten sonuclandirilmis.");
  }

  const fullName = `${request.first_name || ""} ${request.last_name || ""}`.trim() || request.email;

  await query(
    `UPDATE password_reset_requests
     SET status = 'rejected', resolved_at = NOW(), resolved_by = $2
     WHERE id = $1`,
    [requestId, adminUserId],
  );

  await finalizeAdminResetNotifications(requestId, "rejected", fullName, request.email);

  await notificationsSvc.createNotification({
    userId: request.user_id,
    title: "Şifre sıfırlama talebi reddedildi",
    message: "Yönetici şifre sıfırlama talebinizi reddetti. Dershane yönetimi ile iletişime geçin.",
    notificationType: "general",
  });

  return { rejected: true };
}

export async function getRequestStatusForRef(refId) {
  const result = await query(`SELECT id, status FROM password_reset_requests WHERE id = $1`, [refId]);
  return result.rows[0] ?? null;
}
