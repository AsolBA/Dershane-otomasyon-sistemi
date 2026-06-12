import { apiRequest } from "../httpClient.js";
import { joinFullName, unwrapList } from "./mappers.js";
import { buildTeacherLoginEmail } from "../../utils/email.js";

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function mapApiTeacherToUi(row) {
  if (!row) return row;
  const firstName = row.first_name ?? row.firstName ?? "";
  const lastName = row.last_name ?? row.lastName ?? "";
  return {
    id: row.id,
    firstName,
    lastName,
    fullName: joinFullName(firstName, lastName) || row.fullName || "",
    email: row.email ?? "",
    branch: row.branch ?? "",
    phone: row.phone ?? "",
    active: Boolean(row.is_active ?? row.isActive ?? row.active ?? true),
    loginPassword: row.loginPassword ?? row.login_password ?? ""
  };
}

function uiPayloadToApi(payload, { forUpdate = false } = {}) {
  const firstName = String(payload.firstName ?? splitFullName(payload.fullName).firstName ?? "").trim();
  const lastName = String(payload.lastName ?? splitFullName(payload.fullName).lastName ?? "").trim();

  if (!forUpdate && (!firstName || !lastName || lastName === "-")) {
    throw new Error("Ad, soyad ve branş zorunludur.");
  }

  const body = {};
  if (firstName) body.firstName = firstName;
  if (lastName) body.lastName = lastName;
  if (!forUpdate) {
    body.email = buildTeacherLoginEmail(firstName, lastName);
    if (!body.email) throw new Error("Geçerli ad ve soyad girin.");
  } else if (payload.email) {
    body.email = String(payload.email).trim().toLowerCase();
  }
  if (payload.branch) body.branch = payload.branch;
  if (payload.phone !== undefined) body.phone = payload.phone || null;
  if (payload.active !== undefined) body.isActive = Boolean(payload.active);

  return body;
}

export async function getById(id) {
  const row = await apiRequest(`/teachers/${id}`);
  return mapApiTeacherToUi(row);
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
