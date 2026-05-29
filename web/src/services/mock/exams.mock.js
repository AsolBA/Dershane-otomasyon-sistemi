import { createId, getStore } from "./state.js";

export async function listExamsForStudent(studentId) {
  const store = getStore();
  const student = store.students.find((s) => s.id === studentId) || store.students[0];
  const exams = store.exams.filter((e) => e.className === student.className);
  return exams.map((exam) => {
    const result = store.examResults.find((r) => r.examId === exam.id && r.studentId === student.id);
    return { ...exam, score: result?.score ?? null };
  });
}

export async function listExams({ q } = {}) {
  let rows = [...getStore().exams];
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => `${r.name} ${r.date} ${r.className} ${r.courseId}`.toLowerCase().includes(query));
  }
  return rows;
}

export async function createExam(payload) {
  const row = { id: createId("exm"), ...payload };
  getStore().exams.unshift(row);
  return row;
}

export async function updateExam(id, payload) {
  const store = getStore();
  const idx = store.exams.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Sınav bulunamadı.");
  store.exams[idx] = { ...store.exams[idx], ...payload };
  return store.exams[idx];
}

export async function removeExam(id) {
  const store = getStore();
  store.exams = store.exams.filter((r) => r.id !== id);
  store.examResults = store.examResults.filter((r) => r.examId !== id);
}

export async function listResults(examId) {
  return getStore().examResults.filter((r) => r.examId === examId);
}

export async function upsertResult(examId, studentId, score) {
  const store = getStore();
  const others = store.examResults.filter((r) => !(r.examId === examId && r.studentId === studentId));
  if (score === null || score === undefined || score === "") {
    store.examResults = others;
    return;
  }
  store.examResults = [...others, { examId, studentId, score: Number(score) }];
}
