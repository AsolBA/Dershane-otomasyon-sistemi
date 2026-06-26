import { apiRequest } from "../httpClient.js";
import { formatDateOnly, joinFullName, unwrapList } from "./mappers.js";

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
    studentId: String(row.student_id ?? row.studentId),
    status: API_TO_UI_STATUS[status] ?? String(status || "PRESENT").toUpperCase()
  };
}

function mapStudentAttendanceRow(row) {
  const teacherFirst = row.teacher_first_name ?? row.teacherFirstName ?? "";
  const teacherLast = row.teacher_last_name ?? row.teacherLastName ?? "";
  return {
    id: row.id,
    scheduleId: row.schedule_id ?? row.scheduleId,
    date: formatDateOnly(row.attendance_date ?? row.date),
    status: API_TO_UI_STATUS[row.status] ?? String(row.status || "").toUpperCase(),
    courseName: row.course_name ?? row.courseName ?? "",
    teacherName:
      row.teacher_name ??
      row.teacherName ??
      (joinFullName(teacherFirst, teacherLast) || "")
  };
}

export async function listAttendanceForStudent(studentId) {
  if (!studentId) {
    throw new Error("Öğrenci bilgisi bulunamadı. Çıkış yapıp tekrar giriş deneyin.");
  }
  const params = new URLSearchParams({
    studentId: String(studentId),
    fromDate: "2000-01-01",
    toDate: "2099-12-31",
    limit: "100"
  });
  const data = await apiRequest(`/attendance?${params.toString()}`);
  return unwrapList(data).map(mapStudentAttendanceRow);
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
