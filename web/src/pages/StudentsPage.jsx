import { useCallback, useEffect, useState } from "react";
import { studentsService } from "../services";

const emptyForm = {
  fullName: "",
  email: "",
  className: "",
  parentName: "",
  parentPhone: "",
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

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentsService.list({ onlyActive, q: query });
      setRows(data);
    } catch (err) {
      alert(err?.message || "Liste yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [onlyActive, query]);

  useEffect(() => {
    reload();
  }, [reload]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      fullName: row.fullName,
      email: row.email,
      className: row.className,
      parentName: row.parentName,
      parentPhone: row.parentPhone,
      active: Boolean(row.active)
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save() {
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      className: form.className.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      active: Boolean(form.active)
    };

    if (!payload.fullName || !payload.email || !payload.className) {
      alert("Ad, e-posta ve sinif zorunlu.");
      return;
    }

    try {
      if (editingId) await studentsService.update(editingId, payload);
      else await studentsService.create(payload);
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayit basarisiz.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu kaydi silmek istiyor musun?")) return;
    try {
      await studentsService.remove(id);
      if (editingId === id) closeForm();
      await reload();
    } catch (err) {
      alert(err?.message || "Silme basarisiz.");
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Ogrenciler</h1>
          <p className="muted">Service layer uzerinden CRUD (mock veya API).</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni ogrenci
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ogrenci</th>
                <th>Sinif</th>
                <th>Veli</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="muted">
                    Yukleniyor...
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
                  <td>{r.className}</td>
                  <td>
                    <div>{r.parentName}</div>
                    <div className="muted">{r.parentPhone}</div>
                  </td>
                  <td>
                    <span className={r.active ? "pill ok" : "pill bad"}>{r.active ? "Aktif" : "Pasif"}</span>
                  </td>
                  <td style={{ width: 220 }}>
                    <div className="row-actions">
                      <button className="btn" type="button" onClick={() => openEdit(r)}>
                        Duzenle
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
                    Kayit bulunamadi.
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
              <h2 style={{ margin: 0 }}>{editingId ? "Ogrenci duzenle" : "Yeni ogrenci"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Form alanlari SRS’deki ogrenci yonetimiyle uyumlu basit bir baslangic.
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeForm}>
                Iptal
              </button>
              <button className="btn btn-primary" type="button" onClick={save}>
                Kaydet
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Ad Soyad
              <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            </label>
            <label>
              E-posta
              <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </label>
            <label>
              Sinif
              <input value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} />
            </label>
            <label>
              Veli adi
              <input value={form.parentName} onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))} />
            </label>
            <label>
              Veli telefon
              <input value={form.parentPhone} onChange={(e) => setForm((p) => ({ ...p, parentPhone: e.target.value }))} />
            </label>
            <label>
              Durum
              <select value={form.active ? "true" : "false"} onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === "true" }))}>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
