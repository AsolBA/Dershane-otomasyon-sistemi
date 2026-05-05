import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./classes.service.js";

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const data = await svc.listClasses({ page, limit, offset }, req.query.search);
  return sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  return sendSuccess(res, await svc.getClassById(id));
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || b.level === undefined || b.level === null) {
    throw new AppError(400, "VALIDATION_ERROR", "name ve level zorunludur.");
  }
  const created = await svc.createClass({
    name: b.name,
    level: Number(b.level),
    advisorTeacherId: b.advisorTeacherId ?? null,
  });
  return sendSuccess(res, created, "Sinif olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const b = req.body ?? {};
  return sendSuccess(res, await svc.updateClass(id, b), "Sinif guncellendi.");
});

export const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await svc.deleteClass(id);
  return sendSuccess(res, { deleted: true }, "Sinif silindi.");
});

export const students = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  return sendSuccess(res, await svc.listClassStudents(id));
});
