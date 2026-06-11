export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function timeToMinutes(value) {
  const [h, m] = String(value || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function buildWeeklyScheduleGrid(items, enrichers = {}) {
  const { courseLabelById, teacherNameById } = enrichers;

  const byDay = new Map(WEEK_DAYS.map((d) => [d, []]));

  for (const raw of items || []) {
    const day = raw.day;
    if (!byDay.has(day)) continue;
    const entry = {
      ...raw,
      courseName:
        raw.courseName || courseLabelById?.get(String(raw.courseId)) || raw.courseId || "Ders",
      teacherName: raw.teacherName || teacherNameById?.get(String(raw.teacherId)) || "—"
    };
    byDay.get(day).push(entry);
  }

  for (const day of WEEK_DAYS) {
    byDay.get(day).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }

  const days = WEEK_DAYS.filter((d) => {
    if (d === "Saturday" || d === "Sunday") return byDay.get(d).length > 0;
    return true;
  });

  const maxRows = Math.max(0, ...days.map((d) => byDay.get(d).length));

  return {
    days,
    maxRows,
    cellAt(day, rowIndex) {
      return byDay.get(day)?.[rowIndex] ?? null;
    }
  };
}
