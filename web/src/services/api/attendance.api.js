import { apiRequest } from "../httpClient.js";

export async function getAttendance(scheduleId, date) {
  const params = new URLSearchParams({ scheduleId, date });
  const data = await apiRequest(`/attendance?${params.toString()}`);
  return data?.rows ?? data?.items ?? data;
}

export async function saveAttendance(scheduleId, date, rows) {
  return apiRequest("/attendance/mark", {
    method: "POST",
    body: JSON.stringify({ scheduleId, date, records: rows })
  });
}
