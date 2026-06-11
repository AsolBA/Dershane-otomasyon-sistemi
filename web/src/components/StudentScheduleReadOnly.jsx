import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import { coursesService, schedulesService, studentsService, teachersService } from "../services";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";

export default function StudentScheduleReadOnly() {
  const { user } = useAuth();
  const isParent = user?.role === ROLES.PARENT;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classLabel, setClassLabel] = useState(user?.className || "");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === ROLES.STUDENT) {
        setClassLabel(user.className || "");
        setRows(await schedulesService.list({ day: "ALL", q: "" }));
        return;
      }

      if (isParent && user?.linkedStudentId) {
        const student = await studentsService.getById(user.linkedStudentId);
        const cn = student.className || "";
        setClassLabel(cn);
        setRows(cn ? await schedulesService.listForClass(cn) : []);
        return;
      }

      setRows([]);
    } catch (err) {
      alert(err?.message || "Ders programı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user, isParent]);

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

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>{isParent ? "Öğrenci programı" : "Programım"}</h1>
          <p className="muted">
            {classLabel ? (
              <>
                <strong>{classLabel}</strong> sınıfı haftalık programı (salt okunur).
              </>
            ) : (
              "Haftalık ders programı (salt okunur)."
            )}
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Yükleniyor…</p>
        ) : (
          <WeeklyScheduleGrid
            items={rows}
            courseLabelById={courseLabelById}
            teacherNameById={teacherNameById}
            emptyMessage="Bu sınıf için program kaydı yok."
          />
        )}
      </div>
    </section>
  );
}
