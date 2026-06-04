import { apiRequest } from "../httpClient.js";
import * as classesApi from "./classes.api.js";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function generateStudentNo() {
  const suffix = Date.now().toString(36).toUpperCase();
  return `STD-${suffix}`;
}

function buildClassNameMap(classes) {
  const map = new Map();
  for (const c of classes) {
    const id = c.id ?? c.class_id;
    const name = c.name ?? c.class_name;
    if (id != null && name) map.set(Number(id), name);
  }
  return map;
}

function mapApiStudentToUi(row, classNameById) {
  if (!row) return row;
  const firstName = row.first_name ?? row.firstName ?? "";
  const lastName = row.last_name ?? row.lastName ?? "";
  const classId = row.current_class_id ?? row.currentClassId;
  return {
    id: row.id,
    fullName: [firstName, lastName].filter((p) => p && p !== "-").join(" ").trim() || firstName || lastName,
    email: row.email ?? "",
    className: classId != null ? classNameById.get(Number(classId)) ?? "" : "",
    parentName: row.parent_name ?? row.parentName ?? "",
    parentPhone: row.parent_phone ?? row.parentPhone ?? "",
    active: Boolean(row.is_active ?? row.isActive ?? row.active),
    studentNo: row.student_no ?? row.studentNo ?? ""
  };
}

async function loadClassNameMap() {
  const classes = await classesApi.list({});
  return buildClassNameMap(classes);
}

async function resolveClassId(className, classes) {
  const normalized = String(className || "").trim().toLowerCase();
  if (!normalized) return null;
  const match = classes.find((c) => String(c.name ?? c.class_name ?? "").trim().toLowerCase() === normalized);
  return match?.id ?? match?.class_id ?? null;
}

async function uiPayloadToApi(payload, { forUpdate = false } = {}) {
  const classes = await classesApi.list({});
  const { firstName, lastName } = splitFullName(payload.fullName);
  const classId = await resolveClassId(payload.className, classes);

  if (!forUpdate && (!firstName || !lastName || !payload.email)) {
    throw new Error("Ad, e-posta ve sınıf zorunludur.");
  }

  if (!forUpdate && classId == null && payload.className) {
    throw new Error(`"${payload.className}" adlı sınıf bulunamadı. Önce Sınıflar sayfasından oluşturun.`);
  }

  const body = {};
  if (firstName) body.firstName = firstName;
  if (lastName) body.lastName = lastName;
  if (payload.email) body.email = payload.email;
  if (!forUpdate) {
    body.studentNo = (payload.studentNo || "").trim() || generateStudentNo();
  } else if (payload.studentNo) {
    body.studentNo = payload.studentNo.trim();
  }
  if (classId != null) body.currentClassId = classId;
  if (payload.active !== undefined) body.isActive = Boolean(payload.active);

  return body;
}

export async function getById(id) {
  const classNameById = await loadClassNameMap();
  const row = await apiRequest(`/students/${id}`);
  return mapApiStudentToUi(row, classNameById);
}

export async function list({ onlyActive, q } = {}) {
  const params = new URLSearchParams();
  if (onlyActive) params.set("isActive", "true");
  if (q) params.set("search", q);
  const [data, classNameById] = await Promise.all([
    apiRequest(`/students?${params.toString()}`),
    loadClassNameMap()
  ]);
  return unwrapList(data).map((row) => mapApiStudentToUi(row, classNameById));
}

export async function create(payload) {
  const body = await uiPayloadToApi(payload);
  const classNameById = await loadClassNameMap();
  const row = await apiRequest("/students", { method: "POST", body: JSON.stringify(body) });
  return mapApiStudentToUi(row, classNameById);
}

export async function update(id, payload) {
  const body = await uiPayloadToApi(payload, { forUpdate: true });
  const classNameById = await loadClassNameMap();
  const row = await apiRequest(`/students/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapApiStudentToUi(row, classNameById);
}

export async function remove(id) {
  return apiRequest(`/students/${id}`, { method: "DELETE" });
}
