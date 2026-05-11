import { useMemo, useState } from "react";
import { createId, initialClasses } from "../services/mock/mockStore";

const emptyForm = {
  name: "",
  gradeLevel: "",
  capacity: 30,
  active: true
};

export default function ClassesPage() {
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [rows, setRows] = useState(initialClasses);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyActive && !r.active) return false;
      if (!q) return true;
      const haystack = `${r.name} ${r.gradeLevel}`.toLowerCase();
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
      name: row.name,
      gradeLevel: String(row.gradeLevel),
      capacity: Number(row.capacity) || 0,
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
    const capacity = Number(form.capacity);
    const payload = {
      name: form.name.trim(),
      gradeLevel: form.gradeLevel.trim(),
      capacity: Number.isFinite(capacity) ? capacity : 0,
      active: Boolean(form.active)
    };

    if (!payload.name || !payload.gradeLevel || payload.capacity <= 0) {
      alert("Sinif adi, seviye ve kapasite zorunlu.");
      return;
    }

    if (editingId) {
      setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r)));
    } else {
      setRows((prev) => [{ id: createId("cls"), ...payload }, ...prev]);
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
          <h1>Siniflar</h1>
          <p className="muted">Mock veri ile CRUD iskeleti. Ogrenci atama sonraki adim.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni sinif
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinif</th>
                <th>Seviye</th>
                <th>Kapasite</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.gradeLevel}</td>
                  <td>{r.capacity}</td>
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
              <h2 style={{ margin: 0 }}>{editingId ? "Sinif duzenle" : "Yeni sinif"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                UML Class entity’sine denk basit alanlar: name + meta (gradeLevel/capacity).
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
              Sinif adi
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label>
              Seviye
              <input value={form.gradeLevel} onChange={(e) => setForm((p) => ({ ...p, gradeLevel: e.target.value }))} />
            </label>
            <label>
              Kapasite
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
              />
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
