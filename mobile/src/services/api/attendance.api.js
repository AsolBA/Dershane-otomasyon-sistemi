import { apiRequest } from "../httpClient";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function listAttendanceForStudent(studentId) {
  const data = await apiRequest(`/attendance/report?studentId=${encodeURIComponent(studentId || "")}`);
  return unwrapList(data).map((r) => ({
    date: r.date,
    status: r.status,
    studentId: r.studentId
  }));
}

export async function listAttendanceForParent(linkedStudentId) {
  return listAttendanceForStudent(linkedStudentId);
}

export async function getStudentProfile(studentId) {
  if (!studentId) return null;
  try {
    const data = await apiRequest(`/students/${encodeURIComponent(studentId)}`);
    const s = data?.student ?? data;
    if (!s) return null;
    return {
      id: String(s.id),
      fullName: s.fullName || s.name,
      className: s.className || s.class?.name,
      email: s.email
    };
  } catch {
    return null;
  }
}
