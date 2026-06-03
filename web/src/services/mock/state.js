import {
  createId,
  initialAnnouncements,
  initialClasses,
  initialCourses,
  initialExamResults,
  initialExams,
  initialNotifications,
  initialSchedules,
  initialStudents,
  initialTeachers
} from "./mockStore.js";

const store = {
  students: structuredClone(initialStudents),
  teachers: structuredClone(initialTeachers),
  classes: structuredClone(initialClasses),
  courses: structuredClone(initialCourses),
  schedules: structuredClone(initialSchedules),
  exams: structuredClone(initialExams),
  examResults: structuredClone(initialExamResults),
  announcements: structuredClone(initialAnnouncements),
  notifications: structuredClone(initialNotifications)
};

export function getStore() {
  return store;
}

export { createId };
