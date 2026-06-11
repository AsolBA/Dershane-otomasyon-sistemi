import { apiRequest } from "../httpClient.js";
import { findScheduleConflicts } from "../../utils/scheduleConflict.js";
import {
  buildClassMaps,
  dayNameToNumber,
  dayNumberToName,
  formatTime,
  normalizeTimeForApi,
  resolveClassId,
  unwrapList
} from "./mappers.js";
import * as classesApi from "./classes.api.js";

function mapBackendConflictsToUi(conflicts, idToName) {
  return (conflicts || []).map((entry) => {
    const s = entry.schedule || {};
    const className = idToName.get(Number(s.class_id ?? s.classId)) ?? "";
    const day = dayNumberToName(s.day_of_week ?? s.dayOfWeek);
    const startTime = formatTime(s.start_time ?? s.startTime);
    const endTime = formatTime(s.end_time ?? s.endTime);
    const slot = `${startTime}-${endTime}`;
    let message = "Program çakışması.";
    if (entry.type === "class_overlap") {
      message = `Aynı sınıfta aynı anda iki ders olamaz: ${className} (${day}, ${slot}).`;
    } else if (entry.type === "teacher_overlap") {
      message = `Aynı öğretmen aynı anda iki derste olamaz (${day}, ${slot}).`;
    } else if (entry.type === "room_overlap") {
      message = `Aynı derslikte aynı anda iki ders olamaz: ${s.room} (${day}, ${slot}).`;
    }
    return { type: entry.type, message, row: s };
  });
}

function mapApiScheduleToUi(row, idToName) {
  if (!row) return row;
  const classId = Number(row.class_id ?? row.classId);
  return {
    id: row.id,
    day: dayNumberToName(row.day_of_week ?? row.dayOfWeek),
    startTime: formatTime(row.start_time ?? row.startTime),
    endTime: formatTime(row.end_time ?? row.endTime),
    className: idToName.get(classId) ?? "",
    teacherId: row.teacher_id ?? row.teacherId,
    courseId: row.course_id ?? row.courseId,
    room: row.room ?? ""
  };
}

async function loadClassNameMap() {
  const classes = await classesApi.list({});
  return buildClassMaps(classes).idToName;
}

async function uiPayloadToApi(payload) {
  const classes = await classesApi.list({});
  const classId = resolveClassId(payload.className, classes);
  if (classId == null) {
    throw new Error(`"${payload.className}" adlı sınıf bulunamadı. Önce Sınıflar sayfasından oluşturun.`);
  }

  const teacherId = Number(payload.teacherId);
  const courseId = Number(payload.courseId);
  if (!Number.isInteger(teacherId) || teacherId < 1) throw new Error("Geçerli bir öğretmen seçin.");
  if (!Number.isInteger(courseId) || courseId < 1) throw new Error("Geçerli bir ders seçin.");

  return {
    classId,
    courseId,
    teacherId,
    dayOfWeek: dayNameToNumber(payload.day),
    startTime: normalizeTimeForApi(payload.startTime),
    endTime: normalizeTimeForApi(payload.endTime),
    room: payload.room || null
  };
}

function filterSchedules(rows, q) {
  const term = String(q || "").trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((r) =>
    `${r.day} ${r.startTime} ${r.endTime} ${r.className} ${r.room}`.toLowerCase().includes(term)
  );
}

export async function list({ day, q } = {}) {
  const params = new URLSearchParams({ limit: "100" });
  if (day && day !== "ALL") params.set("dayOfWeek", String(dayNameToNumber(day)));
  const [data, idToName] = await Promise.all([
    apiRequest(`/schedules?${params.toString()}`),
    loadClassNameMap()
  ]);
  const rows = unwrapList(data).map((row) => mapApiScheduleToUi(row, idToName));
  return filterSchedules(rows, q);
}

export async function listForClass(className) {
  const rows = await list({ day: "ALL", q: "" });
  if (!className) return rows;
  const normalized = String(className).trim().toLowerCase();
  return rows.filter((r) => String(r.className || "").trim().toLowerCase() === normalized);
}

export async function checkConflict(candidate, ignoreId) {
  const body = await uiPayloadToApi(candidate);
  const idToName = await loadClassNameMap();
  const res = await apiRequest("/schedules/conflict-check", {
    method: "POST",
    body: JSON.stringify({ ...body, excludeScheduleId: ignoreId ? Number(ignoreId) : undefined })
  });
  if (res?.hasConflict) {
    return {
      ok: false,
      errors: [],
      conflicts: mapBackendConflictsToUi(res.conflicts, idToName)
    };
  }
  return { ok: true, errors: [], conflicts: [] };
}

export async function create(payload) {
  const body = await uiPayloadToApi(payload);
  const idToName = await loadClassNameMap();
  const row = await apiRequest("/schedules", { method: "POST", body: JSON.stringify(body) });
  return mapApiScheduleToUi(row, idToName);
}

export async function update(id, payload) {
  const body = await uiPayloadToApi(payload);
  const idToName = await loadClassNameMap();
  const row = await apiRequest(`/schedules/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapApiScheduleToUi(row, idToName);
}

export async function remove(id) {
  return apiRequest(`/schedules/${id}`, { method: "DELETE" });
}
