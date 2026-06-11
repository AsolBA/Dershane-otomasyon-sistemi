import { apiRequest } from "../httpClient.js";
import { joinFullName, splitFullName, unwrapList } from "./mappers.js";
import { isValidLoginEmail, normalizeEmail } from "../../utils/email.js";

function mapApiTeacherToUi(row) {
  if (!row) return row;
  const firstName = row.first_name ?? row.firstName ?? "";
  const lastName = row.last_name ?? row.lastName ?? "";
  return {
    id: row.id,
    fullName: joinFullName(firstName, lastName) || row.fullName || "",
    email: row.email ?? "",
    branch: row.branch ?? "",
    phone: row.phone ?? "",
    active: Boolean(row.is_active ?? row.isActive ?? row.active ?? true)
  };
}

function uiPayloadToApi(payload, { forUpdate = false } = {}) {
  const { firstName, lastName } = splitFullName(payload.fullName);

  if (!forUpdate && (!firstName || !payload.email || !payload.branch)) {
    throw new Error("Ad, e-posta ve branş zorunludur.");
  }

  const email = normalizeEmail(payload.email);
  if (payload.email && !isValidLoginEmail(email)) {
    throw new Error("E-posta adresinde Türkçe veya özel karakter kullanılamaz. Giriş için ASCII karakterler kullanın.");
  }

  const body = {};
  if (firstName) body.firstName = firstName;
  if (lastName) body.lastName = lastName;
  if (payload.email) body.email = email;
  if (payload.branch) body.branch = payload.branch;
  if (payload.phone !== undefined) body.phone = payload.phone || null;
  if (payload.active !== undefined) body.isActive = Boolean(payload.active);

  return body;
}

export async function list({ onlyActive, q } = {}) {
  const params = new URLSearchParams({ limit: "100" });
  if (q) params.set("search", q);
  if (onlyActive) params.set("isActive", "true");
  const data = await apiRequest(`/teachers?${params.toString()}`);
  let rows = unwrapList(data).map(mapApiTeacherToUi);
  if (onlyActive) rows = rows.filter((r) => r.active);
  return rows;
}

export async function create(payload) {
  const body = uiPayloadToApi(payload);
  const row = await apiRequest("/teachers", { method: "POST", body: JSON.stringify(body) });
  return mapApiTeacherToUi(row);
}

export async function update(id, payload) {
  const body = uiPayloadToApi(payload, { forUpdate: true });
  const row = await apiRequest(`/teachers/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapApiTeacherToUi(row);
}

export async function remove(id) {
  await apiRequest(`/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: false })
  });
}
