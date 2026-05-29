import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import StudentScheduleReadOnly from "../components/StudentScheduleReadOnly";
import { coursesService, schedulesService, teachersService } from "../services";
import { findScheduleConflicts } from "../utils/scheduleConflict";
import { formatDay } from "../utils/labels";

const emptyForm = {
  day: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  className: "12-A",
  teacherId: "tch_1",
  courseId: "crs_1",
  room: "A-101"
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulesPage() {
  const { user } = useAuth();
  if (user?.role === ROLES.STUDENT) {
    return <StudentScheduleReadOnly />;
  }
  return <ScheduleAdminPage />;
}

function ScheduleAdminPage() {
  const [query, setQuery] = useState("");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await schedulesService.list({ day: dayFilter, q: query }));
    } catch (err) {
      alert(err?.message || "Liste yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [dayFilter, query]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    (async () => {
      try {
        const [t, c] = await Promise.all([
          teachersService.list({ onlyActive: true }),
          coursesService.list({ onlyActive: true })
        ]);
        setTeachers(t);
        setCourses(c);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const teacherNameById = useMemo(() => {
    const map = new Map();
    for (const t of teachers) map.set(t.id, t.fullName);
    return map;
  }, [teachers]);

  const courseLabelById = useMemo(() => {
    const map = new Map();
    for (const c of courses) map.set(c.id, `${c.name} (${c.code})`);
    return map;
  }, [courses]);

  const conflictPreview = useMemo(() => {
    // Basit bir “mevcut veri” cakisma ozeti (kaydetmeden de gorulsun)
    const issues = [];
    for (const r of rows) {
      const res = findScheduleConflicts({ rows, candidate: r, ignoreId: r.id });
      if (!res.ok) {
        for (const c of res.conflicts) {
          issues.push({ source: r, ...c });
        }
      }
    }
    // dedupe by message+sourceId+type
    const key = (x) => `${x.type}|${x.source.id}|${x.row?.id || ""}|${x.message}`;
    const seen = new Set();
    return issues.filter((x) => {
      const k = key(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [rows]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      day: row.day,
      startTime: row.startTime,
      endTime: row.endTime,
      className: row.className,
      teacherId: row.teacherId,
      courseId: row.courseId,
      room: row.room || ""
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save() {
    const payload = {
      day: String(form.day).trim(),
      startTime: String(form.startTime).trim(),
      endTime: String(form.endTime).trim(),
      className: String(form.className).trim(),
      teacherId: String(form.teacherId).trim(),
      courseId: String(form.courseId).trim(),
      room: String(form.room || "").trim()
    };

    if (!payload.className || !payload.teacherId || !payload.courseId) {
      alert("Sinif, ogretmen ve ders secimi zorunlu.");
      return;
    }

    try {
      if (editingId) await schedulesService.update(editingId, payload);
      else await schedulesService.create(payload);
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayit basarisiz.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu program satirini silmek istiyor musun?")) return;
    try {
      await schedulesService.remove(id);
      if (editingId === id) closeForm();
      await reload();
    } catch (err) {
      alert(err?.message || "Silme basarisiz.");
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Ders Programi</h1>
          <p className="muted">Mock CRUD + sinif/ogretmen/derslik cakisma kontrolu (interval overlap).</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <select className="input" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
            <option value="ALL">Tum gunler</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni satir
          </button>
        </div>
      </div>

      {conflictPreview.length ? (
        <div className="card" style={{ marginBottom: 14, borderColor: "#fecaca", background: "#fff7f7" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Cakisma ozeti</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {conflictPreview.slice(0, 6).map((c, idx) => (
              <li key={idx} className="muted">
                <strong>{c.type}</strong>: {c.message}
              </li>
            ))}
          </ul>
          {conflictPreview.length > 6 ? <div className="muted" style={{ marginTop: 8 }}>+ daha fazla...</div> : null}
        </div>
      ) : null}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gun</th>
                <th>Saat</th>
                <th>Sinif</th>
                <th>Ders</th>
                <th>Ogretmen</th>
                <th>Derslik</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="muted">
                    Yukleniyor...
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{formatDay(r.day)}</td>
                  <td>
                    {r.startTime} - {r.endTime}
                  </td>
                  <td>{r.className}</td>
                  <td className="muted">{courseLabelById.get(r.courseId) || r.courseId}</td>
                  <td className="muted">{teacherNameById.get(r.teacherId) || r.teacherId}</td>
                  <td>{r.room}</td>
                  <td style={{ width: 220 }}>
                    <div className="row-actions">
                      <button className="btn" type="button" onClick={() => openEdit(r)}>
                        Duzenle
                      </button>
                      <button className="btn btn-danger" type="button" onClick={() => remove(r.id)}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
                : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">
                    Kayit bulunamadi.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showForm ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="page-header" style={{ marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: 0 }}>{editingId ? "Program satiri duzenle" : "Yeni program satiri"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                UML Schedule alanlari: day, start/end, className, teacherId, courseId (+ room pratik alan).
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeForm}>
                Iptal
              </button>
              <button className="btn btn-primary" type="button" onClick={save}>
                Kaydet
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Gun
              <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Baslangic
              <input value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} placeholder="09:00" />
            </label>
            <label>
              Bitis
              <input value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} placeholder="10:00" />
            </label>
            <label>
              Sinif
              <input value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} />
            </label>
            <label>
              Ogretmen
              <select value={form.teacherId} onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.branch})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ders
              <select value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Derslik
              <input value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))} />
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
