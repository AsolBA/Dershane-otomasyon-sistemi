import { USE_MOCK_API } from "./config";
import * as authMock from "./mock/auth.mock";
import * as authApi from "./api/auth.api";
import * as examsMock from "./mock/exams.mock";
import * as examsApi from "./api/exams.api";
import * as attendanceMock from "./mock/attendance.mock";
import * as attendanceApi from "./api/attendance.api";
import * as announcementsMock from "./mock/announcements.mock";
import * as announcementsApi from "./api/announcements.api";
import * as schedulesMock from "./mock/schedules.mock";
import * as schedulesApi from "./api/schedules.api";
import * as notificationsMock from "./mock/notifications.mock";
import * as notificationsApi from "./api/notifications.api";
import * as studentsApi from "./api/students.api";

function pick(mock, api) {
  return USE_MOCK_API ? mock : api;
}

export const authService = pick(authMock, authApi);
export const examsService = pick(examsMock, examsApi);
export const attendanceService = pick(attendanceMock, attendanceApi);
export const announcementsService = pick(announcementsMock, announcementsApi);
export const schedulesService = pick(schedulesMock, schedulesApi);
export const notificationsService = pick(notificationsMock, notificationsApi);
export const studentsService = USE_MOCK_API ? { getById: async () => ({ className: "" }) } : studentsApi;

export { USE_MOCK_API, API_BASE_URL } from "./config";
