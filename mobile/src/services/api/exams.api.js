import { apiRequest } from "../httpClient";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function listExamsForStudent(studentId) {
  const data = await apiRequest(`/exams?studentId=${encodeURIComponent(studentId || "")}`);
  const exams = unwrapList(data);
  return exams.map((exam) => ({
    id: String(exam.id),
    name: exam.name || exam.title,
    date: exam.date,
    courseId: exam.courseId,
    className: exam.className,
    score: exam.score ?? exam.myScore ?? null
  }));
}

export async function listExamsForParent(linkedStudentId) {
  return listExamsForStudent(linkedStudentId);
}
