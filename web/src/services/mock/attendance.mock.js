import { getStore } from "./state.js";

/** @type {Record<string, { studentId: string; status: string }[]>} */
const attendanceByKey = {};

const studentAttendanceSeed = {
  stu_1: [
    { id: "att_1", date: "2026-05-01", status: "PRESENT", scheduleId: "sch_1" },
    { id: "att_2", date: "2026-05-02", status: "ABSENT", scheduleId: "sch_1" },
    { id: "att_3", date: "2026-05-03", status: "LATE", scheduleId: "sch_2" },
    { id: "att_4", date: "2026-05-05", status: "PRESENT", scheduleId: "sch_2" }
  ],
  stu_2: [
    { id: "att_5", date: "2026-05-01", status: "PRESENT", scheduleId: "sch_3" },
    { id: "att_6", date: "2026-05-02", status: "PRESENT", scheduleId: "sch_3" }
  ]
};

function keyFor(scheduleId, date) {
  return `${scheduleId}__${date}`;
}

function enrichAttendanceRow(row) {
  const store = getStore();
  const schedule = store.schedules.find((s) => String(s.id) === String(row.scheduleId));
  const course = schedule ? store.courses.find((c) => String(c.id) === String(schedule.courseId)) : null;
  const teacher = schedule ? store.teachers.find((t) => String(t.id) === String(schedule.teacherId)) : null;

  return {
    ...row,
    courseName: course?.name ?? "",
    teacherName: teacher?.fullName ?? ""
  };
}

export async function getAttendance(scheduleId, date) {
  return attendanceByKey[keyFor(scheduleId, date)] || null;
}

export async function saveAttendance(scheduleId, date, rows) {
  attendanceByKey[keyFor(scheduleId, date)] = rows;
}

export async function listAttendanceForStudent(studentId) {
  const id = studentId || "stu_1";
  return [...(studentAttendanceSeed[id] || studentAttendanceSeed.stu_1)].map(enrichAttendanceRow);
}
