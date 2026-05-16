import { useCallback, useEffect, useState } from "react";
import { coursesService } from "../services";

const emptyForm = {
  name: "",
  code: "",
  active: true
};

export default function CoursesPage() {
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
      setRows(await coursesService.list({ onlyActive, q: query }));
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
      name: row.name,
      code: row.code,
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
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      active: Boolean(form.active)
    };

    if (!payload.name || !payload.code) {
      alert("Ders adi ve kodu zorunlu.");
      return;
    }

    try {
      if (editingId) await coursesService.update(editingId, payload);
      else await coursesService.create(payload);
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayit basarisiz.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu kaydi silmek istiyor musun?")) return;
    try {
      await coursesService.remove(id);
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
          <h1>Dersler</h1>
          <p className="muted">Mock veri ile CRUD iskeleti.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni ders
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ders</th>
                <th>Kod</th>
                <th>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Yukleniyor...
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>
                    <span className="pill">{r.code}</span>
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
                  <td colSpan={4} className="muted">
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
              <h2 style={{ margin: 0 }}>{editingId ? "Ders duzenle" : "Yeni ders"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                UML Course entity’sine denk basit alanlar: name (+ kod olarak pratik bir ek alan).
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
              Ders adi
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label>
              Kod
              <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
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
