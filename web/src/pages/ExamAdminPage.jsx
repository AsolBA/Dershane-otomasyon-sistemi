import { useCallback, useEffect, useMemo, useState } from "react";
import { coursesService, examsService, studentsService } from "../services";

const emptyExam = {
  name: "",
  date: "",
  courseId: "crs_1",
  className: "12-A"
};

export default function ExamAdminPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState(emptyExam);
  const [showExamForm, setShowExamForm] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState("");

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
        const [c, s] = await Promise.all([
          coursesService.list({ onlyActive: true }),
          studentsService.list({ onlyActive: true })
        ]);
        setCourses(c);
        setAllStudents(s);
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
    if (!selectedExamId || !exams.some((e) => e.id === selectedExamId)) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  const courseLabelById = useMemo(() => {
    const map = new Map();
    for (const c of courses) map.set(c.id, `${c.name} (${c.code})`);
    return map;
  }, [courses]);

  const selectedExam = useMemo(() => exams.find((e) => e.id === selectedExamId) || null, [exams, selectedExamId]);

  const studentsForSelected = useMemo(() => {
    if (!selectedExam) return [];
    return allStudents.filter((s) => s.className === selectedExam.className);
  }, [selectedExam, allStudents]);

  useEffect(() => {
    if (!selectedExamId) return;
    examsService
      .listResults(selectedExamId)
      .then(setResults)
      .catch(() => setResults([]));
  }, [selectedExamId]);

  const scoreByStudentId = useMemo(() => {
    const map = new Map();
    if (!selectedExam) return map;
    for (const r of results) {
      if (r.examId === selectedExam.id) map.set(r.studentId, r.score);
    }
    return map;
  }, [results, selectedExam]);

  function openCreateExam() {
    setEditingExamId(null);
    setExamForm(emptyExam);
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
        setSelectedExamId(created.id);
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

  async function setScore(studentId, raw) {
    if (!selectedExam) return;
    const n = Number(String(raw).replace(",", "."));
    const score = Number.isFinite(n) ? n : null;
    try {
      await examsService.upsertResult(selectedExam.id, studentId, score);
      const next = await examsService.listResults(selectedExam.id);
      setResults(next);
    } catch (err) {
      alert(err?.message || "Sonuç kaydı başarısız.");
    }
  }

  const summary = useMemo(() => {
    if (!selectedExam) return { count: 0, avg: null };
    const rows = results.filter((r) => r.examId === selectedExam.id);
    if (!rows.length) return { count: 0, avg: null };
    const sum = rows.reduce((acc, r) => acc + r.score, 0);
    return { count: rows.length, avg: sum / rows.length };
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
                      <td className="muted">{courseLabelById.get(e.courseId) || e.courseId}</td>
                      <td>{e.className}</td>
                      <td style={{ width: 240 }}>
                        <div className="row-actions">
                          <button className="btn" type="button" onClick={() => setSelectedExamId(e.id)}>
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
                  <option key={c.id} value={c.id}>
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
                <option key={e.id} value={e.id}>
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

              {selectedExam && studentsForSelected.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Bu sınıfta aktif öğrenci yok.
                  </td>
                </tr>
              ) : null}

              {studentsForSelected.map((s) => {
                const v = scoreByStudentId.get(s.id);
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
                        value={v === undefined ? "" : String(v)}
                        placeholder="Örn: 38.5"
                        onChange={(e) => setScore(s.id, e.target.value)}
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
