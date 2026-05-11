import { useMemo, useState } from "react";
import { createId, initialTeachers } from "../services/mock/mockStore";

const emptyForm = {
  fullName: "",
  email: "",
  branch: "",
  phone: "",
  active: true
};

export default function TeachersPage() {
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [rows, setRows] = useState(initialTeachers);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyActive && !r.active) return false;
      if (!q) return true;
      const haystack = `${r.fullName} ${r.email} ${r.branch} ${r.phone}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, onlyActive]);

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
      branch: row.branch,
      phone: row.phone,
      active: Boolean(row.active)
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function save() {
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      branch: form.branch.trim(),
      phone: form.phone.trim(),
      active: Boolean(form.active)
    };

    if (!payload.fullName || !payload.email || !payload.branch) {
      alert("Ad, e-posta ve brans zorunlu.");
      return;
    }

    if (editingId) {
      setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r)));
    } else {
      setRows((prev) => [{ id: createId("tch"), ...payload }, ...prev]);
    }

    closeForm();
  }

  function remove(id) {
    if (!confirm("Bu kaydi silmek istiyor musun?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) closeForm();
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Ogretmenler</h1>
          <p className="muted">Mock veri ile CRUD iskeleti.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni ogretmen
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ogretmen</th>
                <th>Brans</th>
                <th>Iletisim</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
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
                        Duzenle
                      </button>
                      <button className="btn btn-danger" type="button" onClick={() => remove(r.id)}>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
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
              <h2 style={{ margin: 0 }}>{editingId ? "Ogretmen duzenle" : "Yeni ogretmen"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Brans alani UML’deki Teacher.branch ile uyumlu basit bir karsilik.
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
              Brans
              <input value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} />
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
          </div>
        </div>
      ) : null}
    </section>
  );
}
