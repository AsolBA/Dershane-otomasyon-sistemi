import { initialExamResults, initialExams } from "./mockStore";

export async function listExamsForStudent(studentId) {
  const student = studentId || "stu_1";
  const className = "12-A";
  const exams = initialExams.filter((e) => e.className === className);
  return exams.map((exam) => {
    const result = initialExamResults.find((r) => r.examId === exam.id && r.studentId === student);
    return { ...exam, score: result?.score ?? null };
  });
}

export async function listExamsForParent(linkedStudentId) {
  return listExamsForStudent(linkedStudentId);
}
