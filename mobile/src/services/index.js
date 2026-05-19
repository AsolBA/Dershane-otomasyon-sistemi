import { USE_MOCK_API } from "./config";
import * as authMock from "./mock/auth.mock";
import * as authApi from "./api/auth.api";
import * as examsMock from "./mock/exams.mock";
import * as attendanceMock from "./mock/attendance.mock";
import * as announcementsMock from "./mock/announcements.mock";
import * as schedulesMock from "./mock/schedules.mock";
import * as notificationsMock from "./mock/notifications.mock";

function pick(mock, api) {
  return USE_MOCK_API ? mock : api;
}

export const authService = pick(authMock, authApi);
export const examsService = examsMock;
export const attendanceService = attendanceMock;
export const announcementsService = announcementsMock;
export const schedulesService = schedulesMock;
export const notificationsService = notificationsMock;

export { USE_MOCK_API, API_BASE_URL } from "./config";
