export function createId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export const initialStudents = [
  {
    id: "stu_1",
    fullName: "Ayse Yilmaz",
    email: "ayse@student.local",
    className: "12-A",
    parentName: "Mehmet Yilmaz",
    parentPhone: "05550001111",
    active: true
  },
  {
    id: "stu_2",
    fullName: "Can Demir",
    email: "can@student.local",
    className: "11-B",
    parentName: "Elif Demir",
    parentPhone: "05550002222",
    active: true
  },
  {
    id: "stu_3",
    fullName: "Deniz Kaya",
    email: "deniz@student.local",
    className: "10-C",
    parentName: "Ali Kaya",
    parentPhone: "05550003333",
    active: false
  }
];

export const initialTeachers = [
  {
    id: "tch_1",
    fullName: "Burak Polat",
    email: "burak@teacher.local",
    branch: "Matematik",
    phone: "05551110001",
    active: true
  },
  {
    id: "tch_2",
    fullName: "Ceren Aydin",
    email: "ceren@teacher.local",
    branch: "Fizik",
    phone: "05551110002",
    active: true
  }
];

export const initialClasses = [
  { id: "cls_1", name: "12-A", gradeLevel: "12", capacity: 36, active: true },
  { id: "cls_2", name: "11-B", gradeLevel: "11", capacity: 32, active: true },
  { id: "cls_3", name: "10-C", gradeLevel: "10", capacity: 28, active: true }
];

export const initialCourses = [
  { id: "crs_1", name: "Matematik", code: "MAT", active: true },
  { id: "crs_2", name: "Fizik", code: "FIZ", active: true },
  { id: "crs_3", name: "Kimya", code: "KIM", active: false }
];

export const initialSchedules = [
  {
    id: "sch_1",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    className: "12-A",
    teacherId: "tch_1",
    courseId: "crs_1",
    room: "A-101"
  },
  {
    id: "sch_2",
    day: "Monday",
    startTime: "10:00",
    endTime: "11:00",
    className: "12-A",
    teacherId: "tch_2",
    courseId: "crs_2",
    room: "A-101"
  },
  {
    id: "sch_3",
    day: "Tuesday",
    startTime: "09:30",
    endTime: "10:30",
    className: "11-B",
    teacherId: "tch_1",
    courseId: "crs_1",
    room: "B-204"
  }
];
