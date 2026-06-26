import { useCallback, useEffect, useMemo, useState } from "react";
import { classesService, coursesService, examsService, studentsService } from "../services";

const emptyExam = {
  name: "",
  date: "",
  courseId: "",
  className: "12-A"
};

export default function ExamAdminPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentsForClass, setStudentsForClass] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState(emptyExam);
  const [showExamForm, setShowExamForm] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [draftScores, setDraftScores] = useState({});

  const reloadExams = useCallback(async () => {
    setLoading(true);
    try {
      const list = await examsService.listExams({ q: query });
      setExams(list);
    } catch (err) {
      alert(err?.message || "Sınav listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    reloadExams();
  }, [reloadExams]);

  useEffect(() => {
    (async () => {
      try {
        const c = await coursesService.list({ onlyActive: true });
        setCourses(c);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    if (!exams.length) {
      if (selectedExamId) setSelectedExamId("");
      return;
    }
    if (!selectedExamId || !exams.some((e) => String(e.id) === String(selectedExamId))) {
      setSelectedExamId(String(exams[0].id));
    }
  }, [exams, selectedExamId]);

  const courseLabelById = useMemo(() => {
    const map = new Map();
    for (const c of courses) map.set(String(c.id), `${c.name} (${c.code})`);
    return map;
  }, [courses]);

  const selectedExam = useMemo(
    () => exams.find((e) => String(e.id) === String(selectedExamId)) || null,
    [exams, selectedExamId]
  );

  useEffect(() => {
    if (!selectedExam) {
      setStudentsForClass([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let classId = selectedExam.classId;
        if (!classId && selectedExam.className) {
          const classes = await classesService.list({ onlyActive: true });
          const normalized = String(selectedExam.className).trim().toLowerCase();
          const match = classes.find((c) => String(c.name || "").trim().toLowerCase() === normalized);
          classId = match?.id ?? null;
        }
        if (!classId) {
          if (!cancelled) setStudentsForClass([]);
          return;
        }

        const stu = await studentsService.list({
          onlyActive: true,
          classId,
          limit: 100
        });
        if (!cancelled) setStudentsForClass(stu);
      } catch (err) {
        if (!cancelled) {
          alert(err?.message || "Sınıf öğrencileri yüklenemedi.");
          setStudentsForClass([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedExam]);

  useEffect(() => {
    if (!selectedExamId) return;
    examsService
      .listResults(selectedExamId)
      .then((rows) => {
        setResults(rows);
        const next = {};
        for (const r of rows) {
          next[String(r.studentId)] = r.score == null ? "" : String(r.score);
        }
        setDraftScores(next);
      })
      .catch(() => {
        setResults([]);
        setDraftScores({});
      });
  }, [selectedExamId]);

  const scoreByStudentId = useMemo(() => {
    const map = new Map();
    if (!selectedExam) return map;
    for (const r of results) {
      if (String(r.examId) === String(selectedExam.id)) map.set(String(r.studentId), r.score);
    }
    return map;
  }, [results, selectedExam]);

  function openCreateExam() {
    setEditingExamId(null);
    setExamForm({
      ...emptyExam,
      courseId: courses[0] ? String(courses[0].id) : ""
    });
    setShowExamForm(true);
  }

  function openEditExam(row) {
    setEditingExamId(row.id);
    setExamForm({
      name: row.name,
      date: row.date,
      courseId: row.courseId,
      className: row.className
    });
    setShowExamForm(true);
  }

  function closeExamForm() {
    setShowExamForm(false);
    setEditingExamId(null);
    setExamForm(emptyExam);
  }

  async function saveExam() {
    const payload = {
      name: examForm.name.trim(),
      date: examForm.date.trim(),
      courseId: String(examForm.courseId).trim(),
      className: String(examForm.className).trim()
    };

    if (!payload.name || !payload.date || !payload.courseId || !payload.className) {
      alert("Sınav adı, tarih, ders ve sınıf zorunludur.");
      return;
    }

    try {
      if (editingExamId) {
        await examsService.updateExam(editingExamId, payload);
      } else {
        const created = await examsService.createExam(payload);
        setSelectedExamId(String(created.id));
      }
      await reloadExams();
      closeExamForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    }
  }

  async function removeExam(id) {
    if (!confirm("Bu sınavı ve bağlı sonuçları silmek istiyor musunuz?")) return;
    try {
      await examsService.removeExam(id);
      if (selectedExamId === id) setSelectedExamId("");
      await reloadExams();
      setResults([]);
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  async function saveScore(studentId) {
    if (!selectedExam) return;
    const raw = draftScores[String(studentId)] ?? "";
    if (raw.trim() === "") return;
    const n = Number(String(raw).replace(",", "."));
    if (!Number.isFinite(n)) {
      alert("Geçerli bir puan girin.");
      return;
    }
    try {
      await examsService.upsertResult(selectedExam.id, studentId, n);
      const next = await examsService.listResults(selectedExam.id);
      setResults(next);
      const synced = {};
      for (const r of next) {
        synced[String(r.studentId)] = r.score == null ? "" : String(r.score);
      }
      setDraftScores(synced);
    } catch (err) {
      alert(err?.message || "Sonuç kaydı başarısız.");
    }
  }

  const summary = useMemo(() => {
    if (!selectedExam) return { count: 0, avg: null };
    const scored = results.filter(
      (r) =>
        String(r.examId) === String(selectedExam.id) &&
        r.score != null &&
        r.score !== "" &&
        Number.isFinite(Number(r.score))
    );
    if (!scored.length) return { count: 0, avg: null };
    const sum = scored.reduce((acc, r) => acc + Number(r.score), 0);
    return { count: scored.length, avg: sum / scored.length };
  }, [results, selectedExam]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Sınavlar</h1>
          <p className="muted">Sınav tanımlama ve öğrenci sonuç girişi (yönetici / öğretmen).</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara…" />
          <button className="btn btn-primary" type="button" onClick={openCreateExam}>
            Yeni sınav
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sınav</th>
                <th>Tarih</th>
                <th>Ders</th>
                <th>Sınıf</th>
                <th />
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
              {!loading
                ? exams.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.name}</td>
                      <td>{e.date}</td>
                      <td className="muted">{courseLabelById.get(String(e.courseId)) || e.courseId}</td>
                      <td>{e.className}</td>
                      <td style={{ width: 240 }}>
                        <div className="row-actions">
                          <button className="btn" type="button" onClick={() => setSelectedExamId(String(e.id))}>
                            Sonuçlar
                          </button>
                          <button className="btn" type="button" onClick={() => openEditExam(e)}>
                            Düzenle
                          </button>
                          <button className="btn btn-danger" type="button" onClick={() => removeExam(e.id)}>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && exams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {showExamForm ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="page-header" style={{ marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: 0 }}>{editingExamId ? "Sınav düzenle" : "Yeni sınav"}</h2>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeExamForm}>
                İptal
              </button>
              <button className="btn btn-primary" type="button" onClick={saveExam}>
                Kaydet
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Sınav adı
              <input value={examForm.name} onChange={(e) => setExamForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label>
              Tarih
              <input type="date" value={examForm.date} onChange={(e) => setExamForm((p) => ({ ...p, date: e.target.value }))} />
            </label>
            <label>
              Ders
              <select className="input" value={examForm.courseId} onChange={(e) => setExamForm((p) => ({ ...p, courseId: e.target.value }))}>
                {courses.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sınıf (sonuç kapsamı)
              <input value={examForm.className} onChange={(e) => setExamForm((p) => ({ ...p, className: e.target.value }))} />
            </label>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="page-header" style={{ marginBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>Sonuç girişi</h2>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              Seçilen sınav: <strong>{selectedExam?.name || "—"}</strong> — Ortalama:{" "}
              <strong>{summary.avg == null ? "—" : summary.avg.toFixed(2)}</strong> — Girilen:{" "}
              <strong>{summary.count}</strong>
            </p>
          </div>
          <div className="toolbar">
            <select className="input" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} style={{ minWidth: 280 }}>
              {exams.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.date} — {e.name} ({e.className})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Puan</th>
              </tr>
            </thead>
            <tbody>
              {!selectedExam ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Sınav seçin.
                  </td>
                </tr>
              ) : null}

              {selectedExam && studentsForClass.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Bu sınıfta aktif öğrenci yok.
                  </td>
                </tr>
              ) : null}

              {studentsForClass.map((s) => {
                const sid = String(s.id);
                const v = draftScores[sid] ?? (scoreByStudentId.get(sid) == null ? "" : String(scoreByStudentId.get(sid)));
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                      <div className="muted">{s.email}</div>
                    </td>
                    <td style={{ width: 200 }}>
                      <input
                        className="input"
                        inputMode="decimal"
                        value={v}
                        placeholder="Örn: 85"
                        onChange={(e) => setDraftScores((p) => ({ ...p, [sid]: e.target.value }))}
                        onBlur={() => saveScore(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveScore(s.id);
                        }}
                      />
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
