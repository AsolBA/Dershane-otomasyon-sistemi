export function normalizeTimeInput(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  const withMinutes = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (withMinutes) {
    const hh = Number(withMinutes[1]);
    const mm = Number(withMinutes[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return v;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  const hourOnly = /^(\d{1,2})$/.exec(v);
  if (hourOnly) {
    const hh = Number(hourOnly[1]);
    if (hh < 0 || hh > 23) return v;
    return `${String(hh).padStart(2, "0")}:00`;
  }
  return v;
}

function parseTimeToMinutes(value) {
  const normalized = normalizeTimeInput(value);
  const m = /^(\d{1,2}):(\d{2})$/.exec(normalized);
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
  if (start == null || end == null) errors.push("Saat formatı geçersiz (ör. 11 veya 11:00).");
  if (start != null && end != null && end <= start) errors.push("Bitiş saati baslangictan sonra olmali.");

  if (errors.length) return { ok: false, errors, conflicts: [] };

  const conflicts = [];

  for (const row of rows) {
    if (ignoreId != null && String(row.id) === String(ignoreId)) continue;
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

  }

  return { ok: conflicts.length === 0, errors: [], conflicts };
}
