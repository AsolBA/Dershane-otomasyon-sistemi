import { useCallback, useEffect, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import { examsService } from "../services";

export default function ExamResultsReadOnly({ title, subtitle }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const studentId = user?.role === ROLES.PARENT ? user?.linkedStudentId : user?.studentId;
      const data = await examsService.listExamsForStudent(studentId);
      setRows(data);
    } catch (err) {
      alert(err?.message || "Sınav sonuçları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sınav</th>
                <th>Tarih</th>
                <th>Sınıf</th>
                <th>Puan</th>
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
                    Henüz sınav sonucu yok.
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600 }}>{row.name}</td>
                      <td>{row.date}</td>
                      <td>{row.className}</td>
                      <td>
                        {row.score == null ? (
                          <span className="pill">Sonuç girilmedi</span>
                        ) : (
                          <span className="pill ok">
                            <strong>{row.score}</strong>
                          </span>
                        )}
                      </td>
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
