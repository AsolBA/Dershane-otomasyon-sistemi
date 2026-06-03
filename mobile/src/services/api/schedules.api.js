import { apiRequest } from "../httpClient";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function listForClass(className) {
  const params = new URLSearchParams();
  if (className) params.set("className", className);
  const data = await apiRequest(`/schedules?${params.toString()}`);
  return unwrapList(data).map((s) => ({
    id: String(s.id),
    day: s.day,
    startTime: s.startTime,
    endTime: s.endTime,
    className: s.className,
    courseName: s.courseName || s.course?.name || "Ders",
    room: s.room
  }));
}
