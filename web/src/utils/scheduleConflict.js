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
  return aStart < bEnd && bStart < aEnd;
}

function sameText(a, b) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

export function findScheduleConflicts({ rows, candidate, ignoreId }) {
  const day = String(candidate.day || "").trim();
  const className = String(candidate.className || "").trim();
  const room = String(candidate.room || "").trim();
  const start = parseTimeToMinutes(candidate.startTime);
  const end = parseTimeToMinutes(candidate.endTime);

  const errors = [];
  if (!day) errors.push("Gün zorunlu.");
  if (start == null || end == null) errors.push("Saat formatı geçersiz (ör. 11 veya 11:00).");
  if (start != null && end != null && end <= start) errors.push("Bitiş saati baslangictan sonra olmali.");

  if (errors.length) return { ok: false, errors, conflicts: [] };

  const conflicts = [];
  const seen = new Set();

  function pushConflict(type, message, row) {
    const key = `${type}:${row.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push({ type, message, row });
  }

  for (const row of rows) {
    if (ignoreId != null && String(row.id) === String(ignoreId)) continue;
    if (String(row.day).trim() !== day) continue;

    const rs = parseTimeToMinutes(row.startTime);
    const re = parseTimeToMinutes(row.endTime);
    if (rs == null || re == null || re <= rs) continue;
    if (!intervalsOverlap(start, end, rs, re)) continue;

    const slot = `${row.startTime}-${row.endTime}`;

    if (className && sameText(row.className, className)) {
      pushConflict(
        "CLASS",
        `Aynı sınıfta aynı anda iki ders olamaz: ${className} (${day}, ${slot}).`,
        row
      );
    }

    if (String(row.teacherId) === String(candidate.teacherId)) {
      pushConflict(
        "TEACHER",
        `Aynı öğretmen aynı anda iki derste olamaz (${day}, ${slot}).`,
        row
      );
    }

    if (room && sameText(row.room, room)) {
      pushConflict(
        "ROOM",
        `Aynı derslikte aynı anda iki ders olamaz: ${room} (${day}, ${slot}).`,
        row
      );
    }
  }

  return { ok: conflicts.length === 0, errors: [], conflicts };
}
