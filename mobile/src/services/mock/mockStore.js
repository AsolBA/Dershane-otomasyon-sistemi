export const initialStudents = [
  { id: "stu_1", fullName: "Ayşe Yılmaz", email: "ayse@student.local", className: "12-A", active: true },
  { id: "stu_2", fullName: "Can Demir", email: "can@student.local", className: "11-B", active: true }
];

export const initialExams = [
  { id: "exm_1", name: "TYT Matematik Denemesi 1", date: "2026-05-10", courseId: "crs_1", className: "12-A" },
  { id: "exm_2", name: "AYT Fizik Denemesi 1", date: "2026-05-12", courseId: "crs_2", className: "12-A" }
];

export const initialExamResults = [
  { examId: "exm_1", studentId: "stu_1", score: 38.5 },
  { examId: "exm_2", studentId: "stu_1", score: 22.0 }
];

export const initialSchedules = [
  {
    id: "sch_1",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    className: "12-A",
    courseName: "Matematik",
    room: "A-101"
  },
  {
    id: "sch_2",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "11:00",
    className: "12-A",
    courseName: "Fizik",
    room: "A-101"
  }
];

export const initialAnnouncements = [
  {
    id: "ann_1",
    title: "Veli Toplantısı",
    body: "12-A sınıfı velileri için Cuma günü saat 17:00'de okul konferans salonunda veli toplantısı yapılacaktır.\n\nGündem:\n• Sınav takvimi\n• Yaz okulu programı\n• Devamsızlık bilgilendirmesi\n\nKatılımınızı rica ederiz.",
    scope: "CLASS",
    className: "12-A",
    author: "Kurum Müdürlüğü",
    createdAt: "2026-05-01T10:00:00+03:00"
  },
  {
    id: "ann_2",
    title: "Genel Duyuru",
    body: "Deneme sınavı takvimi güncellenmiştir. Tüm öğrencilerimiz panelden veya mobil uygulamadan güncel programı kontrol edebilir.\n\nSorularınız için rehber öğretmeninize başvurabilirsiniz.",
    scope: "ALL",
    className: "",
    author: "Admin",
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
  }
];

/** @type {Record<string, { studentId: string; status: string }[]>} */
export const attendanceRecords = {};
