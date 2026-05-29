function parseTimeToMinutes(value) {
  const v = String(value || "").trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  // [start, end) overlap check, end exclusive
  return aStart < bEnd && bStart < aEnd;
}

export function findScheduleConflicts({ rows, candidate, ignoreId }) {
  const day = String(candidate.day || "").trim();
  const start = parseTimeToMinutes(candidate.startTime);
  const end = parseTimeToMinutes(candidate.endTime);

  const errors = [];
  if (!day) errors.push("Gün zorunlu.");
  if (start == null || end == null) errors.push("Saat formati HH:MM olmali.");
  if (start != null && end != null && end <= start) errors.push("Bitiş saati baslangictan sonra olmali.");

  if (errors.length) return { ok: false, errors, conflicts: [] };

  const conflicts = [];

  for (const row of rows) {
    if (row.id === ignoreId) continue;
    if (String(row.day).trim() !== day) continue;

    const rs = parseTimeToMinutes(row.startTime);
    const re = parseTimeToMinutes(row.endTime);
    if (rs == null || re == null || re <= rs) continue;

    if (!intervalsOverlap(start, end, rs, re)) continue;

    // Same class overlap
    if (String(row.className).trim() === String(candidate.className).trim()) {
      conflicts.push({
        type: "CLASS",
        message: `Sınıf çakışması: ${row.className} ayni gunde (${day}) ${row.startTime}-${row.endTime} aralığıyla çakışıyor.`,
        row
      });
    }

    // Same teacher overlap
    if (String(row.teacherId) === String(candidate.teacherId)) {
      conflicts.push({
        type: "TEACHER",
        message: `Öğretmen cakismasi: ayni gunde (${day}) ${row.startTime}-${row.endTime} araligiyla başka ders var.`,
        row
      });
    }

    // Same room overlap
    if (String(row.room || "").trim() && String(row.room).trim() === String(candidate.room || "").trim()) {
      conflicts.push({
        type: "ROOM",
        message: `Derslik çakışması: ${row.room} ayni gunde (${day}) ${row.startTime}-${row.endTime} aralığıyla çakışıyor.`,
        row
      });
    }
  }

  return { ok: conflicts.length === 0, errors: [], conflicts };
}
