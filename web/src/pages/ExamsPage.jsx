import { useEffect, useMemo, useState } from "react";
import { createId, initialCourses, initialExamResults, initialExams, initialStudents } from "../services/mock/mockStore";

const emptyExam = {
  name: "",
  date: "",
  courseId: "crs_1",
  className: "12-A"
};

export default function ExamsPage() {
  const [exams, setExams] = useState(initialExams);
  const [results, setResults] = useState(initialExamResults);

  const [query, setQuery] = useState("");
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState(emptyExam);
  const [showExamForm, setShowExamForm] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState(initialExams[0]?.id || "");

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
    for (const c of initialCourses) map.set(c.id, `${c.name} (${c.code})`);
    return map;
  }, []);

  const filteredExams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams.filter((e) => {
      if (!q) return true;
      const haystack = `${e.name} ${e.date} ${e.className} ${e.courseId}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [exams, query]);

  const selectedExam = useMemo(() => exams.find((e) => e.id === selectedExamId) || null, [exams, selectedExamId]);

  const studentsForSelected = useMemo(() => {
    if (!selectedExam) return [];
    return initialStudents.filter((s) => s.active && s.className === selectedExam.className);
  }, [selectedExam]);

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

  function saveExam() {
    const payload = {
      name: examForm.name.trim(),
      date: examForm.date.trim(),
      courseId: String(examForm.courseId).trim(),
      className: String(examForm.className).trim()
    };

    if (!payload.name || !payload.date || !payload.courseId || !payload.className) {
      alert("Sinav adi, tarih, ders ve sinif zorunlu.");
      return;
    }

    if (editingExamId) {
      setExams((prev) => prev.map((e) => (e.id === editingExamId ? { ...e, ...payload } : e)));
    } else {
      const id = createId("exm");
      setExams((prev) => [{ id, ...payload }, ...prev]);
      setSelectedExamId(id);
    }

    closeExamForm();
  }

  function removeExam(id) {
    if (!confirm("Bu sinavi ve bagli sonuclari silmek istiyor musun?")) return;
    const nextExams = exams.filter((e) => e.id !== id);
    setExams(nextExams);
    setResults((prev) => prev.filter((r) => r.examId !== id));
    if (selectedExamId === id) {
      setSelectedExamId(nextExams[0]?.id || "");
    }
  }

  function setScore(studentId, raw) {
    if (!selectedExam) return;
    const n = Number(String(raw).replace(",", "."));
    const score = Number.isFinite(n) ? n : NaN;

    setResults((prev) => {
      const others = prev.filter((r) => !(r.examId === selectedExam.id && r.studentId === studentId));
      if (!Number.isFinite(score)) return others;
      return [...others, { examId: selectedExam.id, studentId, score }];
    });
  }

  function saveResults() {
    alert("Sinav sonuclari kaydedildi (mock).");
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
          <h1>Sinavlar</h1>
          <p className="muted">Sinav CRUD + sinifa gore sonuc girisi (mock). Sonra backend baglanacak.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <button className="btn btn-primary" type="button" onClick={openCreateExam}>
            Yeni sinav
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinav</th>
                <th>Tarih</th>
                <th>Ders</th>
                <th>Sinif</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td>{e.date}</td>
                  <td className="muted">{courseLabelById.get(e.courseId) || e.courseId}</td>
                  <td>{e.className}</td>
                  <td style={{ width: 240 }}>
                    <div className="row-actions">
                      <button className="btn" type="button" onClick={() => setSelectedExamId(e.id)}>
                        Sonuclar
                      </button>
                      <button className="btn" type="button" onClick={() => openEditExam(e)}>
                        Duzenle
                      </button>
                      <button className="btn btn-danger" type="button" onClick={() => removeExam(e.id)}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    Kayit bulunamadi.
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
              <h2 style={{ margin: 0 }}>{editingExamId ? "Sinav duzenle" : "Yeni sinav"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                UML Exam alanlari: name, date, courseId (+ sinif kapsami icin className).
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeExamForm}>
                Iptal
              </button>
              <button className="btn btn-primary" type="button" onClick={saveExam}>
                Kaydet
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Sinav adi
              <input value={examForm.name} onChange={(e) => setExamForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label>
              Tarih
              <input type="date" value={examForm.date} onChange={(e) => setExamForm((p) => ({ ...p, date: e.target.value }))} />
            </label>
            <label>
              Ders
              <select className="input" value={examForm.courseId} onChange={(e) => setExamForm((p) => ({ ...p, courseId: e.target.value }))}>
                {initialCourses.filter((c) => c.active).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sinif (sonuc kapsami)
              <input value={examForm.className} onChange={(e) => setExamForm((p) => ({ ...p, className: e.target.value }))} />
            </label>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="page-header" style={{ marginBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>Sonuc girisi</h2>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              Secilen sinav: <strong>{selectedExam?.name || "-"}</strong> — Ortalama:{" "}
              <strong>{summary.avg == null ? "-" : summary.avg.toFixed(2)}</strong> — Girilen:{" "}
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
            <button className="btn btn-primary" type="button" onClick={saveResults}>
              Kaydet
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ogrenci</th>
                <th>Puan</th>
              </tr>
            </thead>
            <tbody>
              {!selectedExam ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Sinav sec.
                  </td>
                </tr>
              ) : null}

              {selectedExam && studentsForSelected.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    Bu sinifta aktif ogrenci yok (mock veri).
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
                        placeholder="Orn: 38.5"
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
