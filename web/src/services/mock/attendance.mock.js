/** @type {Record<string, { studentId: string; status: string }[]>} */
const attendanceByKey = {};

function keyFor(scheduleId, date) {
  return `${scheduleId}__${date}`;
}

export async function getAttendance(scheduleId, date) {
  return attendanceByKey[keyFor(scheduleId, date)] || null;
}

export async function saveAttendance(scheduleId, date, rows) {
  attendanceByKey[keyFor(scheduleId, date)] = rows;
}
