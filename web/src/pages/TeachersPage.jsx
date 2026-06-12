import { useCallback, useEffect, useMemo, useState } from "react";
import { coursesService, teachersService } from "../services";
import { mergeTeacherBranches } from "../utils/branches";
import { buildTeacherLoginEmail } from "../utils/email";

function splitTeacherName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

const readOnlyInputStyle = { background: "#f8fafc", color: "var(--muted)" };

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  branch: "",
  phone: "",
  active: true
};

export default function TeachersPage() {
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherLoginPassword, setTeacherLoginPassword] = useState("");

  const branchOptions = useMemo(
    () => mergeTeacherBranches({ courses, teachers: rows }),
    [courses, rows]
  );

  const generatedEmail = useMemo(
    () => buildTeacherLoginEmail(form.firstName, form.lastName),
    [form.firstName, form.lastName]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await teachersService.list({ onlyActive, q: query }));
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [onlyActive, query]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    coursesService.list({ onlyActive: true }).then(setCourses).catch(() => setCourses([]));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setTeacherLoginPassword("");
    setShowTeacherPassword(false);
    setShowForm(true);
  }

  async function openEdit(row) {
    let record = row;
    try {
      record = { ...row, ...(await teachersService.getById(row.id)) };
    } catch {
      /* listeden devam */
    }

    const { firstName, lastName } =
      record.firstName || record.lastName
        ? { firstName: record.firstName || "", lastName: record.lastName || "" }
        : splitTeacherName(record.fullName);

    setEditingId(record.id);
    setTeacherLoginPassword(record.loginPassword || "");
    setShowTeacherPassword(false);
    setForm({
      firstName,
      lastName,
      email: record.email || "",
      branch: record.branch,
      phone: record.phone,
      active: Boolean(record.active)
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setTeacherLoginPassword("");
    setShowTeacherPassword(false);
  }

  async function save() {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: editingId ? form.email.trim() : generatedEmail,
      branch: form.branch.trim(),
      phone: form.phone.trim(),
      active: Boolean(form.active)
    };

    if (!payload.firstName || !payload.lastName || !payload.branch) {
      alert("Ad, soyad ve branş zorunludur.");
      return;
    }

    if (!branchOptions.includes(payload.branch)) {
      alert("Geçerli bir branş seçin.");
      return;
    }

    if (!editingId && !generatedEmail) {
      alert("Geçerli ad ve soyad girerek e-posta oluşturulmalı.");
      return;
    }

    try {
      if (editingId) await teachersService.update(editingId, payload);
      else await teachersService.create(payload);
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu öğretmen pasife alınacak ve listeden kaldırılacak. Devam edilsin mi?")) return;
    try {
      await teachersService.remove(id);
      if (String(editingId) === String(id)) closeForm();
      setOnlyActive(true);
      await reload();
      alert("Öğretmen pasife alındı.");
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Öğretmenler</h1>
          <p className="muted">Servis katmanı üzerinden CRUD.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni öğretmen
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Öğretmen</th>
                <th>Branş</th>
                <th>İletişim</th>
                <th>Durum</th>
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
                ? rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                    <div className="muted">{r.email}</div>
                  </td>
                  <td>{r.branch}</td>
                  <td className="muted">{r.phone}</td>
                  <td>
                    <span className={r.active ? "pill ok" : "pill bad"}>{r.active ? "Aktif" : "Pasif"}</span>
                  </td>
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
                  <td colSpan={5} className="muted">
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
              <h2 style={{ margin: 0 }}>{editingId ? "Öğretmen düzenle" : "Yeni öğretmen"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                {editingId
                  ? "Öğretmen bilgilerini güncelleyin."
                  : "Ad ve soyad girildiğinde öğretmen e-postası otomatik oluşturulur."}
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
              Ad
              <input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="Burak"
              />
            </label>
            <label>
              Soyad
              <input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Polat"
              />
            </label>
            <label>
              Öğretmen e-posta
              <input
                value={editingId ? form.email : generatedEmail}
                readOnly
                style={readOnlyInputStyle}
                placeholder="adsoyad.teacher@dershane.local"
              />
            </label>
            <label>
              Branş
              <select value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}>
                <option value="">Branş seçin</option>
                {branchOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Telefon
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </label>
            <label>
              Durum
              <select value={form.active ? "true" : "false"} onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === "true" }))}>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </label>
            {editingId ? (
              <label>
                Öğretmen şifresi
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <input
                    readOnly
                    value={
                      teacherLoginPassword
                        ? showTeacherPassword
                          ? teacherLoginPassword
                          : "••••••••••••"
                        : "—"
                    }
                    style={{ ...readOnlyInputStyle, flex: 1, fontFamily: teacherLoginPassword ? "monospace" : undefined }}
                  />
                  {teacherLoginPassword ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowTeacherPassword((v) => !v)}
                      title={showTeacherPassword ? "Gizle" : "Göster"}
                      aria-label={showTeacherPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showTeacherPassword ? "🙈" : "👁"}
                    </button>
                  ) : null}
                </div>
                {!teacherLoginPassword ? (
                  <span className="muted" style={{ fontSize: 12 }}>
                    Kayıtlı şifre yok. Öğretmen şifresini bir kez değiştirdikten sonra burada görünür.
                  </span>
                ) : null}
              </label>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
