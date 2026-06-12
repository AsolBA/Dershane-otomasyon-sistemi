import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./notifications.service.js";

export const listMine = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const onlyUnread = req.query.onlyUnread === "true" || req.query.onlyUnread === true;
  const data = await svc.listMyNotifications(req.user.id, { page, limit, offset }, onlyUnread);
  return sendSuccess(res, data);
});

export const createNotification = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.userId || !b.title || !b.message) {
    throw new AppError(400, "VALIDATION_ERROR", "userId, title ve message zorunludur.");
  }

  const created = await svc.createNotification({
    userId: Number(b.userId),
    announcementId: b.announcementId,
    title: b.title,
    message: b.message,
    isRead: b.isRead,
  });

  return sendSuccess(res, created, "Bildirim olusturuldu.", 201);
});

export const markReadNotification = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const row = await svc.markRead(id, req.user.id);
  return sendSuccess(res, row, "Okundu olarak isaretlendi.");
});

export const markReadAllMine = asyncHandler(async (req, res) => {
  const summary = await svc.markAllRead(req.user.id);
  return sendSuccess(res, summary);
});

export const deleteMine = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "ids dizisi zorunludur.");
  }
  const result = await svc.deleteNotifications(req.user.id, ids);
  return sendSuccess(res, result, "Bildirimler silindi.");
});

export const deleteNotificationById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const result = await svc.deleteNotification(id, req.user.id);
  return sendSuccess(res, result, "Bildirim silindi.");
});
