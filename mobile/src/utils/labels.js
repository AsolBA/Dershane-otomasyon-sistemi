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

export function formatAnnouncementScope(scope, className) {
  if (scope === "ALL") return "Genel duyuru";
  return `Sınıf: ${className || "—"}`;
}

export function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return iso || "—";
  }
}
