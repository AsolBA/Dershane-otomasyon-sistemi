import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import StudentScheduleReadOnly from "../components/StudentScheduleReadOnly";
import { classesService, coursesService, schedulesService, teachersService } from "../services";
import { findScheduleConflicts, normalizeTimeInput } from "../utils/scheduleConflict";
import { formatDay } from "../utils/labels";
import { CLASSROOMS } from "../utils/constants";
import { mergeTeacherBranches } from "../utils/branches";

const emptyForm = {
  day: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  className: "12-A",
  branch: "",
  teacherId: "",
  courseId: "",
  room: CLASSROOMS[0]
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulesPage() {
  const { user } = useAuth();
  if (user?.role === ROLES.STUDENT || user?.role === ROLES.PARENT) {
    return <StudentScheduleReadOnly />;
  }
  return <ScheduleAdminPage />;
}

function ScheduleAdminPage() {
  const [query, setQuery] = useState("");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [filtered, all] = await Promise.all([
        schedulesService.list({ day: dayFilter, q: query }),
        schedulesService.list({ day: "ALL", q: "" })
      ]);
      setRows(filtered);
      setAllRows(all);
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [dayFilter, query]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadRefs = useCallback(async () => {
    const [t, c, cls] = await Promise.all([
      teachersService.list({ onlyActive: true }),
      coursesService.list({ onlyActive: true }),
      classesService.list({ onlyActive: true })
    ]);
    setTeachers(t);
    setCourses(c);
    setClasses(cls);
    return { teachers: t, courses: c, classes: cls };
  }, []);

  useEffect(() => {
    loadRefs().catch(() => {});
  }, [loadRefs]);

  const branchOptions = useMemo(
    () => mergeTeacherBranches({ courses, teachers }),
    [courses, teachers]
  );

  const filteredTeachers = useMemo(() => {
    if (!form.branch) return teachers;
    return teachers.filter((t) => t.branch === form.branch);
  }, [teachers, form.branch]);

  const teacherNameById = useMemo(() => {
    const map = new Map();
    for (const t of teachers) map.set(String(t.id), t.fullName);
    return map;
  }, [teachers]);

  const courseLabelById = useMemo(() => {
    const map = new Map();
    for (const c of courses) map.set(String(c.id), `${c.name} (${c.code})`);
    return map;
  }, [courses]);

  const conflictPreview = useMemo(() => {
    if (!showForm) return [];
    const candidate = {
      ...form,
      startTime: normalizeTimeInput(form.startTime),
      endTime: normalizeTimeInput(form.endTime)
    };
    const res = findScheduleConflicts({ rows: allRows, candidate, ignoreId: editingId });
    return res.conflicts;
  }, [showForm, form, allRows, editingId]);

  async function openCreate() {
    setEditingId(null);
    const refs = await loadRefs().catch(() => ({ teachers, courses, classes }));
    const defaultBranch = mergeTeacherBranches({ courses: refs.courses || courses, teachers: refs.teachers || teachers })[0] || "";
    const branchTeachers = (refs.teachers || teachers).filter((t) => t.branch === defaultBranch);
    const classList = refs.classes || classes;
    setForm({
      ...emptyForm,
      className: classList[0]?.name || "12-A",
      branch: defaultBranch,
      teacherId: branchTeachers[0] ? String(branchTeachers[0].id) : "",
      courseId: (refs.courses || courses)[0] ? String((refs.courses || courses)[0].id) : ""
    });
    setShowForm(true);
  }

  function openEdit(row) {
    const teacher = teachers.find((t) => String(t.id) === String(row.teacherId));
    setEditingId(row.id);
    setForm({
      day: row.day,
      startTime: row.startTime,
      endTime: row.endTime,
      className: row.className,
      branch: teacher?.branch || "",
      teacherId: String(row.teacherId),
      courseId: String(row.courseId),
      room: row.room || CLASSROOMS[0]
    });
    setShowForm(true);
  }

  function onBranchChange(branch) {
    const nextTeachers = teachers.filter((t) => t.branch === branch);
    setForm((p) => ({
      ...p,
      branch,
      teacherId: nextTeachers[0] ? String(nextTeachers[0].id) : ""
    }));
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save() {
    const payload = {
      day: String(form.day).trim(),
      startTime: normalizeTimeInput(form.startTime),
      endTime: normalizeTimeInput(form.endTime),
      className: String(form.className).trim(),
      teacherId: String(form.teacherId).trim(),
      courseId: String(form.courseId).trim(),
      room: String(form.room || "").trim()
    };

    if (!payload.className || !payload.teacherId || !payload.courseId) {
      alert("Sınıf, öğretmen ve ders seçimi zorunludur.");
      return;
    }

    const localCheck = findScheduleConflicts({ rows: allRows, candidate: payload, ignoreId: editingId });
    if (!localCheck.ok) {
      const msg = [...localCheck.errors, ...localCheck.conflicts.map((c) => c.message)].join("\n");
      alert(msg || "Program çakışması var.");
      return;
    }

    try {
      const remoteCheck = await schedulesService.checkConflict(payload, editingId);
      if (!remoteCheck.ok) {
        const msg = [...remoteCheck.errors, ...remoteCheck.conflicts.map((c) => c.message)].join("\n");
        alert(msg || "Program çakışması var.");
        return;
      }
      if (editingId) await schedulesService.update(editingId, payload);
      else await schedulesService.create(payload);
      await Promise.all([reload(), loadRefs()]);
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu program satırını silmek istiyor musunuz?")) return;
    try {
      await schedulesService.remove(id);
      if (editingId === id) closeForm();
      await reload();
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Ders programı</h1>
          <p className="muted">Sınıf, öğretmen ve derslik çakışma kontrolü.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <select className="input" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
            <option value="ALL">Tüm günler</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {formatDay(d)}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni satır
          </button>
        </div>
      </div>

      {conflictPreview.length ? (
        <div className="card" style={{ marginBottom: 14, borderColor: "#fecaca", background: "#fff7f7" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Çakışma özeti</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {conflictPreview.slice(0, 6).map((c, idx) => (
              <li key={idx} className="muted">
                {c.message}
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
                <th>Gün</th>
                <th>Saat</th>
                <th>Sınıf</th>
                <th>Ders</th>
                <th>Öğretmen</th>
                <th>Derslik</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="muted">
                    Yükleniyor…
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
                  <td className="muted">{courseLabelById.get(String(r.courseId)) || r.courseId}</td>
                  <td className="muted">{teacherNameById.get(String(r.teacherId)) || r.teacherId}</td>
                  <td>{r.room}</td>
                  <td style={{ width: 220 }}>
                    <div className="row-actions">
                      <button className="btn" type="button" onClick={() => openEdit(r)}>
                        Düzenle
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
                    Kayıt bulunamadı.
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
              <h2 style={{ margin: 0 }}>{editingId ? "Program satırı düzenle" : "Yeni program satırı"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Gün, saat, sınıf, öğretmen ve ders bilgileri.
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeForm}>
                İptal
              </button>
              <button className="btn btn-primary" type="button" onClick={save}>
                Kaydet
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Gün
              <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {formatDay(d)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Başlangıç
              <input value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} placeholder="09:00" />
            </label>
            <label>
              Bitiş
              <input value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} placeholder="10:00" />
            </label>
            <label>
              Sınıf
              <select value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}>
                {classes.length === 0 ? <option value="">Önce sınıf oluşturun</option> : null}
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Branş
              <select value={form.branch} onChange={(e) => onBranchChange(e.target.value)}>
                <option value="">Branş seçin</option>
                {branchOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Öğretmen
              <select value={form.teacherId} onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}>
                {filteredTeachers.length === 0 ? (
                  <option value="">Bu branşta öğretmen yok</option>
                ) : null}
                {filteredTeachers.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.fullName} ({t.branch})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ders
              <select value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}>
                {courses.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Derslik
              <select value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}>
                {CLASSROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
