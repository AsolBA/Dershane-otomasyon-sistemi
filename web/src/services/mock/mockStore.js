export function createId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export const initialStudents = [
  {
    id: "stu_1",
    fullName: "Ayşe Yılmaz",
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

export const initialExams = [
  {
    id: "exm_1",
    name: "TYT Matematik Denemesi 1",
    date: "2026-05-10",
    courseId: "crs_1",
    className: "12-A"
  },
  {
    id: "exm_2",
    name: "AYT Fizik Denemesi 1",
    date: "2026-05-12",
    courseId: "crs_2",
    className: "12-A"
  }
];

/** @type {{ examId: string; studentId: string; score: number }[]} */
export const initialExamResults = [
  { examId: "exm_1", studentId: "stu_1", score: 38.5 }
];

export const initialAnnouncements = [
  {
    id: "ann_1",
    title: "Veli Toplantisi",
    body: "12-A sınıfı için veli toplantısı Cuma günü saat 17:00'de.",
    scope: "CLASS",
    className: "12-A",
    createdAt: "2026-05-01T10:00:00+03:00"
  },
  {
    id: "ann_2",
    title: "Genel Duyuru",
    body: "Deneme sınavı takvimi güncellendi. Lütfen panelden kontrol edin.",
    scope: "ALL",
    className: "",
    createdAt: "2026-05-01T11:30:00+03:00"
  }
];

export const initialNotifications = [
  {
    id: "ntf_1",
    title: "Yeni duyuru",
    body: "Genel duyuru yayınlandı.",
    read: false,
    createdAt: "2026-05-01T11:31:00+03:00"
  },
  {
    id: "ntf_2",
    title: "Program hatırlatması",
    body: "Yarın 09:00'da Matematik dersi var.",
    read: true,
    createdAt: "2026-04-30T09:00:00+03:00"
  }
];
