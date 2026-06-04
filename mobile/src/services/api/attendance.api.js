import { apiRequest } from "../httpClient";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

function mapStatus(status) {
  return String(status || "").toUpperCase();
}

export async function listAttendanceForStudent(studentId) {
  if (!studentId) return [];

  const data = await apiRequest(
    `/attendance?studentId=${encodeURIComponent(studentId)}&limit=100`
  );

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

    return {
      id: String(s.id),
      fullName: s.fullName || s.name || [firstName, lastName].filter(Boolean).join(" ").trim(),
      className: s.className || s.class?.name || "",
      email: s.email ?? ""
    };
  } catch {
    return null;
  }
}
