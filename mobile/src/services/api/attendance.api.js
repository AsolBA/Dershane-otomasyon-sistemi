import { apiRequest } from "../httpClient";
import { joinFullName, unwrapList } from "./mappers";
import * as classesApi from "./classes.api";

const API_TO_UI_STATUS = {
  present: "PRESENT",
  absent: "ABSENT",
  late: "LATE",
  excused: "EXCUSED"
};

function mapStatus(status) {
  const key = String(status || "").toLowerCase();
  return API_TO_UI_STATUS[key] ?? String(status || "").toUpperCase();
}

async function loadClassName(classId) {
  if (classId == null) return "";
  try {
    const classes = await classesApi.list({});
    const match = classes.find((c) => Number(c.id) === Number(classId));
    return match?.name ?? "";
  } catch {
    return "";
  }
}

export async function listAttendanceForStudent(studentId) {
  if (!studentId) {
    throw new Error("Öğrenci bilgisi bulunamadı. Çıkış yapıp tekrar giriş yapın.");
  }
  const params = new URLSearchParams({
    studentId: String(studentId),
    fromDate: "2000-01-01",
    toDate: "2099-12-31"
  });
  const data = await apiRequest(`/attendance?${params.toString()}`);
  return unwrapList(data).map((r) => ({
    date: r.attendance_date ?? r.attendanceDate ?? r.date,
    status: mapStatus(r.status),
    studentId: String(r.student_id ?? r.studentId ?? studentId)
  }));
}

export async function listAttendanceForParent(linkedStudentId) {
  return listAttendanceForStudent(linkedStudentId);
}

export async function getStudentProfile(studentId) {
  if (!studentId) return null;
  try {
    const s = await apiRequest(`/students/${encodeURIComponent(studentId)}`);
    if (!s) return null;

    const firstName = s.first_name ?? s.firstName ?? "";
    const lastName = s.last_name ?? s.lastName ?? "";
    const classId = s.current_class_id ?? s.currentClassId;
    const className = s.className || (classId != null ? await loadClassName(classId) : "");

    return {
      id: String(s.id),
      fullName: joinFullName(firstName, lastName) || s.fullName || s.name || "",
      className,
      email: s.email ?? ""
    };
  } catch {
    return null;
  }
}
