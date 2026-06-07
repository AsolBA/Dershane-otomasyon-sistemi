import { apiRequest } from "../httpClient";
import { unwrapList } from "./mappers";
import * as classesApi from "./classes.api";

async function loadClassNameMap() {
  const classes = await classesApi.list({});
  const map = new Map();
  for (const c of classes) {
    const id = Number(c.id);
    if (Number.isFinite(id)) map.set(id, c.name);
  }
  return map;
}

function mapMyResultRow(row, classNameById) {
  const classId = Number(row.class_id ?? row.classId);
  const date = row.exam_date ?? row.examDate ?? row.date ?? "";
  return {
    id: String(row.id),
    name: row.name ?? "",
    date: typeof date === "string" ? date.slice(0, 10) : date,
    className: classNameById.get(classId) ?? row.className ?? "",
    score: row.score ?? null
  };
}

async function fetchMyResults(studentId) {
  const params = new URLSearchParams();
  if (studentId) params.set("studentId", String(studentId));
  const [data, classNameById] = await Promise.all([
    apiRequest(`/exams/my/results?${params.toString()}`),
    loadClassNameMap()
  ]);
  return unwrapList(data).map((row) => mapMyResultRow(row, classNameById));
}

export async function listExamsForStudent(studentId) {
  return fetchMyResults(studentId);
}

export async function listExamsForParent(linkedStudentId) {
  if (!linkedStudentId) {
    throw new Error("Öğrenci bilgisi bulunamadı. Çıkış yapıp tekrar giriş yapın.");
  }
  return fetchMyResults(linkedStudentId);
}
