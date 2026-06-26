import { attendanceRecords, initialStudents } from "./mockStore";

function keyFor(studentId, month) {
  return `${studentId}__${month}`;
}

const seedAttendance = [
  { id: "att_1", date: "2026-05-01", status: "PRESENT", scheduleId: "sch_1", courseName: "Matematik", teacherName: "Burak Polat" },
  { id: "att_2", date: "2026-05-02", status: "ABSENT", scheduleId: "sch_1", courseName: "Matematik", teacherName: "Burak Polat" },
  { id: "att_3", date: "2026-05-03", status: "LATE", scheduleId: "sch_2", courseName: "Fizik", teacherName: "Ceren Aydin" }
];

export async function listAttendanceForStudent(studentId) {
  const k = keyFor(studentId, "2026-05");
  if (!attendanceRecords[k]) {
    attendanceRecords[k] = seedAttendance.map((r) => ({ ...r, studentId }));
  }
  return attendanceRecords[k];
}

export async function listAttendanceForParent(linkedStudentId) {
  return listAttendanceForStudent(linkedStudentId || "stu_1");
}

export function getStudentProfile(studentId) {
  return initialStudents.find((s) => s.id === studentId) || initialStudents[0];
}
