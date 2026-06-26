import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StudentImportModal from "../components/StudentImportModal";
import { classesService, studentsService } from "../services";
import { buildParentLoginEmail, buildStudentLoginEmail } from "../utils/email";
import { parseStudentExcelFile } from "../utils/parseStudentExcel";
import { buildStudentListParams, sortStudentsByClassAndName } from "../utils/studentListFilters";

function splitStudentName(fullName) {
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
  className: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  active: true
};

export default function StudentsPage() {
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState([]);
  const [importRows, setImportRows] = useState(null);
  const [importFileName, setImportFileName] = useState("");
  const importInputRef = useRef(null);
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentLoginPassword, setStudentLoginPassword] = useState("");
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [parentLoginPassword, setParentLoginPassword] = useState("");
  const [listFilter, setListFilter] = useState({ matchedClass: null, mode: "all" });

  const listParams = useMemo(
    () => buildStudentListParams({ query, onlyActive, classes }),
    [query, onlyActive, classes]
  );

  const displayRows = useMemo(() => sortStudentsByClassAndName(rows), [rows]);

  const generatedEmail = useMemo(
    () => buildStudentLoginEmail(form.firstName, form.lastName),
    [form.firstName, form.lastName]
  );

  const generatedParentEmail = useMemo(
    () => buildParentLoginEmail(form.firstName, form.lastName),
    [form.firstName, form.lastName]
  );

  const parentEmailPreview = form.parentEmail || generatedParentEmail;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { params, matchedClass, mode } = listParams;
      const data = await studentsService.list(params);
      setRows(data);
      setListFilter({ matchedClass, mode });
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    classesService
      .list({ onlyActive: true })
      .then(setClasses)
      .catch(() => setClasses([]));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      className: classes[0]?.name || ""
    });
    setShowForm(true);
  }

  async function openEdit(row) {
    let record = row;
    try {
      record = { ...row, ...(await studentsService.getById(row.id)) };
    } catch {
      /* listeden devam */
    }

    const { firstName, lastName } = splitStudentName(record.fullName);
    setEditingId(record.id);
    setStudentLoginPassword(record.loginPassword || "");
    setParentLoginPassword(record.parentLoginPassword || "");
    setShowStudentPassword(false);
    setShowParentPassword(false);
    setForm({
      firstName,
      lastName,
      email: record.email || "",
      className: record.className,
      parentName: record.parentName || row.parentName || "",
      parentPhone: record.parentPhone || row.parentPhone || "",
      parentEmail: record.parentEmail || row.parentEmail || buildParentLoginEmail(firstName, lastName),
      active: Boolean(record.active)
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setShowStudentPassword(false);
    setShowParentPassword(false);
    setStudentLoginPassword("");
    setParentLoginPassword("");
  }

  async function save() {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: editingId ? form.email.trim() : generatedEmail,
      className: form.className.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      parentEmail: editingId ? form.parentEmail.trim() : generatedParentEmail,
      active: Boolean(form.active)
    };

    if (!payload.firstName || !payload.lastName || !payload.className) {
      alert("Ad, soyad ve sınıf zorunludur.");
      return;
    }

    if (!payload.parentName) {
      alert("Veli adı zorunludur.");
      return;
    }

    if (!payload.parentPhone) {
      alert("Veli telefon numarası zorunludur.");
      return;
    }

    if (!editingId && (!payload.email || !payload.parentEmail)) {
      alert("Geçerli ad ve soyad girerek e-postalar oluşturulmalı.");
      return;
    }

    try {
      if (editingId) await studentsService.update(editingId, payload);
      else await studentsService.create(payload);
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    }
  }

  function openImportPicker() {
    importInputRef.current?.click();
  }

  async function onImportFileSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const knownClasses = classes.map((c) => c.name).filter(Boolean);
      const existingStudentEmails = await studentsService.collectExistingStudentEmails();
      const rows = await parseStudentExcelFile(file, { knownClasses, existingStudentEmails });
      setImportFileName(file.name);
      setImportRows(rows);
    } catch (err) {
      alert(err?.message || "Excel dosyası okunamadı.");
    }
  }

  function closeImportModal() {
    setImportRows(null);
    setImportFileName("");
  }

  async function remove(id) {
    if (
      !confirm(
        "Bu öğrenci kalıcı olarak silinecek (giriş hesabı, veli hesabı ve ilişkili kayıtlar dahil). Devam edilsin mi?"
      )
    ) {
      return;
    }
    try {
      await studentsService.remove(id);
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
          <h1>Öğrenciler</h1>
          <p className="muted">
            {listFilter.mode === "class" && listFilter.matchedClass
              ? `${listFilter.matchedClass.name} sınıfı listeleniyor.`
              : "Sınıf adı veya öğrenci adı ile arayın."}
          </p>
        </div>
        <div className="toolbar">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Öğrenci adı veya sınıf ara…"
          />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <div className="toolbar-actions-stack">
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Yeni öğrenci
            </button>
            <button className="btn btn-primary" type="button" onClick={openImportPicker}>
              Öğrenci içe aktar
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              hidden
              onChange={onImportFileSelected}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {!loading && displayRows.length > 0 ? (
          <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>
            {displayRows.length} öğrenci listeleniyor
            {listFilter.mode === "search" && query.trim() ? ` (“${query.trim()}” araması)` : ""}
          </p>
        ) : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Sınıf</th>
                <th>Veli</th>
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
                ? displayRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                    <div className="muted">{r.email}</div>
                  </td>
                  <td>{r.className}</td>
                  <td>
                    <div>{r.parentName || "—"}</div>
                    <div className="muted">{r.parentPhone || "—"}</div>
                    {r.parentEmail ? <div className="muted">{r.parentEmail}</div> : null}
                  </td>
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
              {!loading && displayRows.length === 0 ? (
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
              <h2 style={{ margin: 0 }}>{editingId ? "Öğrenci düzenle" : "Yeni öğrenci"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                {editingId
                  ? "Öğrenci ve veli bilgilerini güncelleyin."
                  : "Ad ve soyad girildiğinde öğrenci ve veli e-postaları otomatik oluşturulur."}
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
                placeholder="Emirhan"
              />
            </label>
            <label>
              Soyad
              <input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Kıvanç"
              />
            </label>
            <label>
              Öğrenci e-posta
              <input
                value={editingId ? form.email : generatedEmail}
                readOnly
                style={readOnlyInputStyle}
                placeholder="adsoyad.student@dershane.local"
              />
            </label>
            <label>
              Sınıf
              <select value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}>
                <option value="">Sınıf seçin</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Veli ad soyad
              <input
                value={form.parentName}
                onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))}
                placeholder="Fatma Kaya"
              />
            </label>
            <label>
              Veli telefon
              <input
                value={form.parentPhone}
                onChange={(e) => setForm((p) => ({ ...p, parentPhone: e.target.value }))}
                placeholder="5551234567"
              />
            </label>
            <label>
              Veli e-posta
              <input
                value={parentEmailPreview}
                readOnly
                style={readOnlyInputStyle}
              />
            </label>
            {editingId ? (
              <label>
                Veli şifresi
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <input
                    readOnly
                    value={
                      parentLoginPassword
                        ? showParentPassword
                          ? parentLoginPassword
                          : "••••••••••••"
                        : "—"
                    }
                    style={{ ...readOnlyInputStyle, flex: 1, fontFamily: parentLoginPassword ? "monospace" : undefined }}
                  />
                  {parentLoginPassword ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowParentPassword((v) => !v)}
                      title={showParentPassword ? "Gizle" : "Göster"}
                      aria-label={showParentPassword ? "Veli şifresini gizle" : "Veli şifresini göster"}
                    >
                      {showParentPassword ? "🙈" : "👁"}
                    </button>
                  ) : null}
                </div>
                {!parentLoginPassword ? (
                  <span className="muted" style={{ fontSize: 12 }}>
                    Kayıtlı veli şifresi yok. Veli şifresini bir kez değiştirdikten sonra burada görünür.
                  </span>
                ) : null}
              </label>
            ) : null}
            <label>
              Durum
              <select value={form.active ? "true" : "false"} onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === "true" }))}>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </label>
            {editingId ? (
              <label>
                Öğrenci şifresi
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <input
                    readOnly
                    value={
                      studentLoginPassword
                        ? showStudentPassword
                          ? studentLoginPassword
                          : "••••••••••••"
                        : "—"
                    }
                    style={{ ...readOnlyInputStyle, flex: 1, fontFamily: studentLoginPassword ? "monospace" : undefined }}
                  />
                  {studentLoginPassword ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowStudentPassword((v) => !v)}
                      title={showStudentPassword ? "Gizle" : "Göster"}
                      aria-label={showStudentPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showStudentPassword ? "🙈" : "👁"}
                    </button>
                  ) : null}
                </div>
                {!studentLoginPassword ? (
                  <span className="muted" style={{ fontSize: 12 }}>
                    Kayıtlı şifre yok. Öğrenci şifresini bir kez değiştirdikten sonra burada görünür.
                  </span>
                ) : null}
              </label>
            ) : null}
          </div>
        </div>
      ) : null}

      {importRows ? (
        <StudentImportModal
          rows={importRows}
          fileName={importFileName}
          onClose={closeImportModal}
          onImported={reload}
        />
      ) : null}
    </section>
  );
}
