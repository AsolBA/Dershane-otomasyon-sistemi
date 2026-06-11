import { ROLES } from "../auth/AuthContext";

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Yönetici",
  [ROLES.DIRECTOR]: "Kurum müdürü",
  [ROLES.TEACHER]: "Öğretmen",
  [ROLES.STUDENT]: "Öğrenci",
  [ROLES.PARENT]: "Veli"
};

export const DAY_LABELS = {
  Monday: "Pazartesi",
  Tuesday: "Salı",
  Wednesday: "Çarşamba",
  Thursday: "Perşembe",
  Friday: "Cuma",
  Saturday: "Cumartesi",
  Sunday: "Pazar"
};

export const ATTENDANCE_STATUS_LABELS = {
  PRESENT: "Geldi",
  ABSENT: "Gelmedi",
  LATE: "Geç kaldı",
  EXCUSED: "Mazeret"
};

export function formatDay(day) {
  return DAY_LABELS[day] || day;
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || role || "-";
}

export function formatAnnouncementScope(scope, className) {
  if (scope === "CLASS" && className) return `Sınıf: ${className}`;
  return "Genel";
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}
