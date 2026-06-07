import { apiRequest } from "../httpClient.js";
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

export async function list({ day, q } = {}) {
  const params = new URLSearchParams();
  if (day && day !== "ALL") params.set("dayOfWeek", String(dayNameToNumber(day)));
  if (q) params.set("search", q);
  const [data, idToName] = await Promise.all([
    apiRequest(`/schedules?${params.toString()}`),
    loadClassNameMap()
  ]);
  return unwrapList(data).map((row) => mapApiScheduleToUi(row, idToName));
}

export async function checkConflict(candidate, ignoreId) {
  const body = await uiPayloadToApi(candidate);
  return apiRequest("/schedules/conflict-check", {
    method: "POST",
    body: JSON.stringify({ ...body, excludeScheduleId: ignoreId ? Number(ignoreId) : undefined })
  });
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
