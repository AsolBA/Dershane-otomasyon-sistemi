import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, optionalBool, parsePagination } from "../../utils/query-params.js";
import * as usersService from "./users.service.js";

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = {
    roleName: req.query.role,
    search: req.query.search,
    isActive: optionalBool(req.query.isActive),
  };
  const data = await usersService.listUsers(filters, { page, limit, offset });
  return sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (req.user.role !== "admin" && req.user.role !== "manager" && Number(req.user.id) !== id) {
    throw new AppError(403, "AUTH_FORBIDDEN", "Bu kullaniciyi goruntuleyemezsiniz.");
  }
  const user = await usersService.getUserById(id);
  return sendSuccess(res, user);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  if (!body.firstName || !body.lastName || !body.email || !body.password || !body.roleName) {
    throw new AppError(400, "VALIDATION_ERROR", "firstName, lastName, email, password, roleName zorunludur.");
  }
  const user = await usersService.createUser(body);
  return sendSuccess(res, user, "Kullanici olusturuldu.", 201);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const user = await usersService.updateUser(id, req.body ?? {});
  return sendSuccess(res, user, "Kullanici guncellendi.");
});

export const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const data = await usersService.deactivateUser(id);
  return sendSuccess(res, data, "Kullanici pasiflestirildi.");
});
