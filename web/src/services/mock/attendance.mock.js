/** @type {Record<string, { studentId: string; status: string }[]>} */
const attendanceByKey = {};

const studentAttendanceSeed = {
  stu_1: [
    { date: "2026-05-01", status: "PRESENT" },
    { date: "2026-05-02", status: "ABSENT" },
    { date: "2026-05-03", status: "LATE" },
    { date: "2026-05-05", status: "PRESENT" }
  ],
  stu_2: [
    { date: "2026-05-01", status: "PRESENT" },
    { date: "2026-05-02", status: "PRESENT" }
  ]
};

function keyFor(scheduleId, date) {
  return `${scheduleId}__${date}`;
}

export async function getAttendance(scheduleId, date) {
  return attendanceByKey[keyFor(scheduleId, date)] || null;
}

export async function saveAttendance(scheduleId, date, rows) {
  attendanceByKey[keyFor(scheduleId, date)] = rows;
}

export async function listAttendanceForStudent(studentId) {
  const id = studentId || "stu_1";
  return [...(studentAttendanceSeed[id] || studentAttendanceSeed.stu_1)];
}
