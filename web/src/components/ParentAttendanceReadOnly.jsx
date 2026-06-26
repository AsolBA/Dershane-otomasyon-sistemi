import { useCallback, useEffect, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import { attendanceService, studentsService } from "../services";
import { ATTENDANCE_STATUS_LABELS } from "../utils/labels";

function resolveStudentId(user) {
  if (user?.role === ROLES.STUDENT) return user?.studentId ?? user?.id;
  return user?.linkedStudentId;
}

function rowKey(row) {
  return String(row.id ?? `${row.scheduleId || "na"}__${row.date}`);
}

export default function ParentAttendanceReadOnly() {
  const { user } = useAuth();
  const isStudent = user?.role === ROLES.STUDENT;
  const studentId = resolveStudentId(user);
  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, attendance] = await Promise.all([
        isStudent ? Promise.resolve(null) : studentsService.getById(studentId),
        attendanceService.listAttendanceForStudent(studentId)
      ]);
      setStudent(profile);
      setRows(attendance);
    } catch (err) {
      alert(err?.message || "Devamsızlık kayıtları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [isStudent, studentId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const absentCount = rows.filter((r) => r.status === "ABSENT").length;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Devamsızlık</h1>
          <p className="muted">
            {isStudent
              ? "Ders bazında devamsızlık kayıtlarınız (salt okunur)."
              : "Bağlı öğrencinizin devamsızlık özeti (salt okunur)."}
          </p>
        </div>
      </div>

      {student ? (
        <div className="card stat-row" style={{ marginBottom: 14 }}>
          <div>
            <div className="stat-label">Öğrenci</div>
            <div className="stat-value">{student.fullName}</div>
            <div className="muted">
              {student.className} · {student.email}
            </div>
          </div>
          <div className="stat-chip bad">
            <span className="stat-label">Devamsız ders</span>
            <span className="stat-value">{absentCount}</span>
          </div>
        </div>
      ) : isStudent ? (
        <div className="card stat-row" style={{ marginBottom: 14 }}>
          <div>
            <div className="stat-label">Öğrenci</div>
            <div className="stat-value">{user?.name || "—"}</div>
            {user?.className ? <div className="muted">{user.className}</div> : null}
          </div>
          <div className="stat-chip bad">
            <span className="stat-label">Devamsız ders</span>
            <span className="stat-value">{absentCount}</span>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ders</th>
                <th>Öğretmen</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Yükleniyor…
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((row) => {
                    const bad = row.status === "ABSENT";
                    return (
                      <tr key={rowKey(row)}>
                        <td style={{ fontWeight: 600 }}>{row.date}</td>
                        <td>{row.courseName || "—"}</td>
                        <td>{row.teacherName || "—"}</td>
                        <td>
                          <span className={`pill ${bad ? "bad" : "ok"}`}>
                            {ATTENDANCE_STATUS_LABELS[row.status] || row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
