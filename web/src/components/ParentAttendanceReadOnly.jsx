import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { attendanceService, studentsService } from "../services";
import { ATTENDANCE_STATUS_LABELS } from "../utils/labels";

export default function ParentAttendanceReadOnly() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const studentId = user?.linkedStudentId;
      const [profile, attendance] = await Promise.all([
        studentsService.getById(studentId),
        attendanceService.listAttendanceForStudent(studentId)
      ]);
      setStudent(profile);
      setRows(attendance);
    } catch (err) {
      alert(err?.message || "Devamsızlık kayıtları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user?.linkedStudentId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const absentCount = rows.filter((r) => r.status === "ABSENT").length;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Devamsızlık</h1>
          <p className="muted">Bağlı öğrencinizin devamsızlık özeti (salt okunur).</p>
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
            <span className="stat-label">Devamsız gün</span>
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
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Yükleniyor…
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((row) => {
                    const bad = row.status === "ABSENT";
                    return (
                      <tr key={row.date}>
                        <td style={{ fontWeight: 600 }}>{row.date}</td>
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
