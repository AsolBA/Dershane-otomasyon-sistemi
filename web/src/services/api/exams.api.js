import { apiRequest } from "../httpClient.js";
import { formatDateOnly, resolveClassId, unwrapList } from "./mappers.js";
import * as classesApi from "./classes.api.js";

async function loadClassNameMap() {
  const classes = await classesApi.list({});
  const map = new Map();
  for (const c of classes) {
    const id = Number(c.id);
    if (Number.isFinite(id)) map.set(id, c.name);
  }
  return map;
}

function mapApiExamToUi(row, classNameById) {
  if (!row) return row;
  const classId = Number(row.class_id ?? row.classId);
  return {
    id: row.id,
    name: row.name ?? "",
    date: formatDateOnly(row.exam_date ?? row.examDate ?? ""),
    courseId: row.course_id ?? row.courseId,
    classId: Number.isFinite(classId) ? classId : null,
    className: classNameById.get(classId) ?? "",
    maxScore: row.max_score ?? row.maxScore ?? 100
  };
}

async function uiPayloadToApi(payload) {
  const classes = await classesApi.list({});
  const classId = resolveClassId(payload.className, classes);
  if (classId == null && payload.className) {
    throw new Error(`"${payload.className}" adlı sınıf bulunamadı.`);
  }
  const courseId = Number(payload.courseId);
  if (!Number.isInteger(courseId) || courseId < 1) throw new Error("Geçerli bir ders seçin.");

  return {
    name: payload.name,
    examDate: payload.date,
    courseId,
    classId: classId ?? null
  };
}

function mapMyResultRow(row, classNameById) {
  const classId = Number(row.class_id ?? row.classId);
  return {
    id: row.id,
    name: row.name ?? "",
    date: formatDateOnly(row.exam_date ?? row.examDate ?? ""),
    className: classNameById.get(classId) ?? "",
    score: row.score ?? null
  };
}

export async function listExamsForStudent(studentId) {
  const params = new URLSearchParams();
  if (studentId) params.set("studentId", String(studentId));
  const [data, classNameById] = await Promise.all([
    apiRequest(`/exams/my/results?${params.toString()}`),
    loadClassNameMap()
  ]);
  return unwrapList(data).map((row) => mapMyResultRow(row, classNameById));
}

function filterExams(rows, q) {
  const term = String(q || "").trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((r) => `${r.name} ${r.className} ${r.date}`.toLowerCase().includes(term));
}

export async function listExams({ q } = {}) {
  const [data, classNameById] = await Promise.all([apiRequest("/exams"), loadClassNameMap()]);
  const rows = unwrapList(data).map((row) => mapApiExamToUi(row, classNameById));
  return filterExams(rows, q);
}

export async function createExam(payload) {
  const body = await uiPayloadToApi(payload);
  const classNameById = await loadClassNameMap();
  const row = await apiRequest("/exams", { method: "POST", body: JSON.stringify(body) });
  return mapApiExamToUi(row, classNameById);
}

export async function updateExam(id, payload) {
  const body = await uiPayloadToApi(payload);
  const classNameById = await loadClassNameMap();
  const row = await apiRequest(`/exams/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return mapApiExamToUi(row, classNameById);
}

export async function removeExam(id) {
  return apiRequest(`/exams/${id}`, { method: "DELETE" });
}

export async function listResults(examId) {
  const data = await apiRequest(`/exams/${examId}/results`);
  return unwrapList(data).map((row) => ({
    examId: Number(examId),
    studentId: row.student_id ?? row.studentId,
    score: row.score
  }));
}

export async function upsertResult(examId, studentId, score) {
  return apiRequest(`/exams/${examId}/results`, {
    method: "POST",
    body: JSON.stringify({ studentId: Number(studentId), score: Number(score) })
  });
}
