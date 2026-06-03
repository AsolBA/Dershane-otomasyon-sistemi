import { useCallback, useEffect, useState } from "react";
import { classesService } from "../services";

const emptyForm = {
  name: "",
  gradeLevel: "",
  capacity: 30,
  active: true
};

export default function ClassesPage() {
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
      setRows(await classesService.list({ onlyActive, q: query }));
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
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

  async function save() {
    const capacity = Number(form.capacity);
    const payload = {
      name: form.name.trim(),
      gradeLevel: form.gradeLevel.trim(),
      capacity: Number.isFinite(capacity) ? capacity : 0,
      active: Boolean(form.active)
    };

    if (!payload.name || !payload.gradeLevel || payload.capacity <= 0) {
      alert("Sınıf adı, seviye ve kapasite zorunlu.");
      return;
    }

    try {
      if (editingId) await classesService.update(editingId, payload);
      else await classesService.create(payload);
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu kaydı silmek istiyor musunuz?")) return;
    try {
      await classesService.remove(id);
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
          <h1>Sınıflar</h1>
          <p className="muted">Mock veri ile CRUD ekranı. Öğrenci atama sonraki adim.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <label className="pill">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Sadece aktif
          </label>
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni sınıf
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sınıf</th>
                <th>Seviye</th>
                <th>Kapasite</th>
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
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.gradeLevel}</td>
                  <td>{r.capacity}</td>
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
              <h2 style={{ margin: 0 }}>{editingId ? "Sınıf düzenle" : "Yeni sınıf"}</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Sınıf adı, seviye ve kapasite.
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
              Sınıf adı
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
