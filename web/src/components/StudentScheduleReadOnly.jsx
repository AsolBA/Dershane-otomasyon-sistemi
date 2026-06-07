import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { coursesService, schedulesService, teachersService } from "../services";
import { formatDay } from "../utils/labels";

export default function StudentScheduleReadOnly() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  const className = user?.className || "";

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await schedulesService.list({ day: "ALL", q: "" });
      setRows(list.filter((r) => r.className === className));
    } catch (err) {
      alert(err?.message || "Ders programı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [className]);

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
    for (const t of teachers) map.set(String(t.id), t.fullName);
    return map;
  }, [teachers]);

  const courseLabelById = useMemo(() => {
    const map = new Map();
    for (const c of courses) map.set(String(c.id), c.name);
    return map;
  }, [courses]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const da = String(a.day).localeCompare(String(b.day));
      if (da !== 0) return da;
      return String(a.startTime).localeCompare(String(b.startTime));
    });
  }, [rows]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Programım</h1>
          <p className="muted">
            <strong>{className}</strong> sınıfına ait haftalık ders programı (salt okunur).
          </p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gün</th>
                <th>Saat</th>
                <th>Ders</th>
                <th>Öğretmen</th>
                <th>Derslik</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="muted">
                    Yükleniyor…
                  </td>
                </tr>
              ) : null}
              {!loading && sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    Bu sınıf için program kaydı yok.
                  </td>
                </tr>
              ) : null}
              {!loading
                ? sorted.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{formatDay(r.day)}</td>
                      <td>
                        {r.startTime} – {r.endTime}
                      </td>
                      <td>{courseLabelById.get(String(r.courseId)) || r.courseId}</td>
                      <td className="muted">{teacherNameById.get(String(r.teacherId)) || "—"}</td>
                      <td>{r.room}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
