import { USE_MOCK_API } from "./config.js";

import * as authMock from "./mock/auth.mock.js";
import * as authApi from "./api/auth.api.js";

import * as studentsMock from "./mock/students.mock.js";
import * as studentsApi from "./api/students.api.js";

import * as parentsApi from "./api/parents.api.js";

import * as teachersMock from "./mock/teachers.mock.js";
import * as teachersApi from "./api/teachers.api.js";

import * as classesMock from "./mock/classes.mock.js";
import * as classesApi from "./api/classes.api.js";

import * as coursesMock from "./mock/courses.mock.js";
import * as coursesApi from "./api/courses.api.js";

import * as schedulesMock from "./mock/schedules.mock.js";
import * as schedulesApi from "./api/schedules.api.js";

import * as examsMock from "./mock/exams.mock.js";
import * as examsApi from "./api/exams.api.js";

import * as attendanceMock from "./mock/attendance.mock.js";
import * as attendanceApi from "./api/attendance.api.js";

import * as announcementsMock from "./mock/announcements.mock.js";
import * as announcementsApi from "./api/announcements.api.js";

import * as notificationsMock from "./mock/notifications.mock.js";
import * as notificationsApi from "./api/notifications.api.js";

function pick(mock, api) {
  return USE_MOCK_API ? mock : api;
}

export const authService = pick(authMock, authApi);
export const studentsService = pick(studentsMock, studentsApi);
export const parentsService = USE_MOCK_API ? { list: async () => [] } : parentsApi;
export const teachersService = pick(teachersMock, teachersApi);
export const classesService = pick(classesMock, classesApi);
export const coursesService = pick(coursesMock, coursesApi);
export const schedulesService = pick(schedulesMock, schedulesApi);
export const examsService = pick(examsMock, examsApi);
export const attendanceService = pick(attendanceMock, attendanceApi);
export const announcementsService = pick(announcementsMock, announcementsApi);
export const notificationsService = pick(notificationsMock, notificationsApi);

export { USE_MOCK_API, API_BASE_URL } from "./config.js";
