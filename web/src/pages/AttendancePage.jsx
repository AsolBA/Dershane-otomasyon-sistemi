import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import ParentAttendanceReadOnly from "../components/ParentAttendanceReadOnly";
import { attendanceService, schedulesService, studentsService, teachersService } from "../services";

const STATUSES = [
  { value: "PRESENT", label: "Geldi" },
  { value: "ABSENT", label: "Gelmedi" },
  { value: "LATE", label: "Gec kaldi" },
  { value: "EXCUSED", label: "Mazeret" }
];

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AttendancePage() {
  const { user } = useAuth();
  if (user?.role === ROLES.PARENT) {
    return <ParentAttendanceReadOnly />;
  }
  return <AttendanceAdminPage />;
}

function AttendanceAdminPage() {
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [allStudents, setAllStudents] = useState([]);

  const [rows, setRows] = useState([]);
  const [teachersRef, setTeachersRef] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [sch, stu, tch] = await Promise.all([
          schedulesService.list(),
          studentsService.list({ onlyActive: true }),
          teachersService.list({ onlyActive: true })
        ]);
        setSchedules(sch);
        setAllStudents(stu);
        setTeachersRef(tch);
        if (sch[0]?.id) setScheduleId(sch[0].id);
      } catch (err) {
        alert(err?.message || "Veri yuklenemedi.");
      }
    })();
  }, []);

  const teacherNameById = useMemo(() => {
    const map = new Map();
    for (const t of teachersRef) map.set(t.id, t.fullName);
    return map;
  }, [teachersRef]);

  const schedule = useMemo(() => schedules.find((s) => s.id === scheduleId) || null, [schedules, scheduleId]);

  const studentsForClass = useMemo(() => {
    if (!schedule) return [];
    return allStudents.filter((s) => s.className === schedule.className);
  }, [schedule, allStudents]);

  const loadAttendance = useCallback(async () => {
    if (!schedule) {
      setRows([]);
      return;
    }
    const existing = await attendanceService.getAttendance(schedule.id, date);
    if (existing && existing.length) {
      setRows(existing);
      return;
    }
    setRows(
      studentsForClass.map((s) => ({
        studentId: s.id,
        status: "PRESENT"
      }))
    );
  }, [schedule, date, studentsForClass]);

  useEffect(() => {
    loadAttendance().catch((err) => alert(err?.message || "Yoklama yuklenemedi."));
  }, [loadAttendance]);

  function setStatus(studentId, status) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  }

  function markAll(status) {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  }

  async function save() {
    if (!schedule) return;
    try {
      await attendanceService.saveAttendance(schedule.id, date, rows);
      alert("Yoklama kaydedildi.");
    } catch (err) {
      alert(err?.message || "Kayit basarisiz.");
    }
  }

  const summary = useMemo(() => {
    const map = new Map(STATUSES.map((s) => [s.value, 0]));
    for (const r of rows) map.set(r.status, (map.get(r.status) || 0) + 1);
    return STATUSES.map((s) => ({ ...s, count: map.get(s.value) || 0 }));
  }, [rows]);

  const scheduleOptions = useMemo(() => {
    return [...schedules].sort((a, b) => {
      const da = String(a.day).localeCompare(String(b.day));
      if (da !== 0) return da;
      return String(a.startTime).localeCompare(String(b.startTime));
    });
  }, [schedules]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Yoklama</h1>
          <p className="muted">Program satirini sec, siniftaki aktif ogrenciler icin durum isaretle (mock).</p>
        </div>
        <div className="toolbar">
          <button className="btn" type="button" onClick={() => markAll("PRESENT")}>
            Tumunu geldi
          </button>
          <button className="btn" type="button" onClick={() => markAll("ABSENT")}>
            Tumunu gelmedi
          </button>
          <button className="btn btn-primary" type="button" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "end" }}>
          <label>
            Program satiri
            <select className="input" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)}>
              {scheduleOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.day} {s.startTime}-{s.endTime} | {s.className} | {teacherNameById.get(s.teacherId) || s.teacherId}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tarih
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {schedule ? (
          <div className="muted" style={{ marginTop: 10 }}>
            Secilen sinif: <strong>{schedule.className}</strong> — Derslik: <strong>{schedule.room}</strong>
          </div>
        ) : null}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Ozet</div>
        <div className="toolbar">
          {summary.map((s) => (
            <span key={s.value} className="pill">
              {s.label}: <strong>{s.count}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ogrenci</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {studentsForClass.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Bu sinifta aktif ogrenci bulunamadi (mock veri).
                  </td>
                </tr>
              ) : null}

              {studentsForClass.map((stu) => {
                const row = rows.find((r) => r.studentId === stu.id);
                const status = row?.status || "PRESENT";
                return (
                  <tr key={stu.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{stu.fullName}</div>
                      <div className="muted">{stu.email}</div>
                    </td>
                    <td style={{ width: 260 }}>
                      <select className="input" value={status} onChange={(e) => setStatus(stu.id, e.target.value)}>
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
