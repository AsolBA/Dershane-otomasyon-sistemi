import { apiRequest } from "../httpClient";
import {
  buildClassMaps,
  dayNameToNumber,
  dayNumberToName,
  formatTime,
  unwrapList
} from "./mappers";
import * as classesApi from "./classes.api";
import * as teachersApi from "./teachers.api";
import * as coursesApi from "./courses.api";

async function loadClassNameMap() {
  const classes = await classesApi.list({});
  return buildClassMaps(classes).idToName;
}

function mapApiScheduleToUi(row, idToName, teacherNameById, courseNameById) {
  if (!row) return row;
  const classId = Number(row.class_id ?? row.classId);
  const teacherId = row.teacher_id ?? row.teacherId;
  const courseId = row.course_id ?? row.courseId;
  return {
    id: String(row.id),
    day: dayNumberToName(row.day_of_week ?? row.dayOfWeek ?? row.day),
    startTime: formatTime(row.start_time ?? row.startTime),
    endTime: formatTime(row.end_time ?? row.endTime),
    className: idToName.get(classId) ?? row.className ?? "",
    teacherId: teacherId != null ? String(teacherId) : "",
    teacherName: teacherNameById.get(String(teacherId)) ?? "",
    courseId: courseId != null ? String(courseId) : "",
    courseName: courseNameById.get(String(courseId)) ?? row.courseName ?? "Ders",
    room: row.room ?? ""
  };
}

async function loadTeacherAndCourseMaps() {
  const [teachers, courses] = await Promise.all([
    teachersApi.list({ onlyActive: true }),
    coursesApi.list({ onlyActive: true })
  ]);
  const teacherNameById = new Map();
  for (const t of teachers) teacherNameById.set(String(t.id), t.fullName);
  const courseNameById = new Map();
  for (const c of courses) courseNameById.set(String(c.id), c.name);
  return { teacherNameById, courseNameById };
}

export async function list({ day } = {}) {
  const params = new URLSearchParams();
  if (day && day !== "ALL") params.set("dayOfWeek", String(dayNameToNumber(day)));
  const [data, idToName, maps] = await Promise.all([
    apiRequest(`/schedules?${params.toString()}`),
    loadClassNameMap(),
    loadTeacherAndCourseMaps()
  ]);
  return unwrapList(data).map((row) =>
    mapApiScheduleToUi(row, idToName, maps.teacherNameById, maps.courseNameById)
  );
}

export async function listForClass(className) {
  const rows = await list({});
  if (!className) return rows;
  return rows.filter((r) => r.className === className);
}
