import { AppError } from "./app-error.js";

export function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limitRaw = Number(query.limit) || 20;
  const limit = Math.min(100, Math.max(1, limitRaw));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function parseId(param, name = "id") {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "VALIDATION_INVALID_ID", `${name} gecersiz.`);
  }
  return id;
}

export function optionalBool(value) {
  if (value === undefined || value === "") return undefined;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return undefined;
}
