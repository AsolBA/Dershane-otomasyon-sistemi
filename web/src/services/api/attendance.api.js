import { apiRequest } from "../httpClient.js";
import { unwrapList } from "./mappers.js";

const UI_TO_API_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused"
};

const API_TO_UI_STATUS = {
  present: "PRESENT",
  absent: "ABSENT",
  late: "LATE",
  excused: "EXCUSED"
};

function mapApiAttendanceRow(row) {
  const status = row.status ?? row.attendance_status;
  return {
    studentId: row.student_id ?? row.studentId,
    status: API_TO_UI_STATUS[status] ?? String(status || "PRESENT").toUpperCase()
  };
}

export async function listAttendanceForStudent(studentId) {
  if (!studentId) {
    throw new Error("Öğrenci bilgisi bulunamadı. Çıkış yapıp tekrar giriş deneyin.");
  }
  const params = new URLSearchParams({
    studentId: String(studentId),
    fromDate: "2000-01-01",
    toDate: "2099-12-31"
  });
  const data = await apiRequest(`/attendance?${params.toString()}`);
  return unwrapList(data).map((row) => ({
    date: row.attendance_date ?? row.date,
    status: API_TO_UI_STATUS[row.status] ?? String(row.status || "").toUpperCase()
  }));
}

export async function getAttendance(scheduleId, date) {
  const params = new URLSearchParams({
    scheduleId: String(scheduleId),
    fromDate: date,
    toDate: date
  });
  const data = await apiRequest(`/attendance?${params.toString()}`);
  const rows = unwrapList(data).map(mapApiAttendanceRow);
  return rows.length ? rows : null;
}

export async function saveAttendance(scheduleId, date, rows) {
  for (const row of rows) {
    const status = UI_TO_API_STATUS[row.status] ?? String(row.status || "PRESENT").toLowerCase();
    await apiRequest("/attendance/mark", {
      method: "POST",
      body: JSON.stringify({
        studentId: Number(row.studentId),
        scheduleId: Number(scheduleId),
        attendanceDate: date,
        status
      })
    });
  }
}
