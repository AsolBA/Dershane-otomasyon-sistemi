import { useCallback, useEffect, useState } from "react";
import AnnouncementDetailModal from "../components/AnnouncementDetailModal";
import { announcementsService, classesService } from "../services";
import { formatDateTime } from "../utils/labels";

const emptyForm = {
  title: "",
  body: "",
  scope: "ALL",
  className: "12-A"
};

export default function AnnouncementsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classOptions, setClassOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await announcementsService.list({ q: query }));
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    classesService.list({ onlyActive: true }).then((c) => setClassOptions(c.map((x) => x.name)));
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
  }

  async function save() {
    const title = form.title.trim();
    const body = form.body.trim();
    const scope = form.scope === "CLASS" ? "CLASS" : "ALL";
    const className = scope === "CLASS" ? String(form.className || "").trim() : "";

    if (!title || !body) {
      alert("Başlık ve içerik zorunludur.");
      return;
    }
    if (scope === "CLASS" && !className) {
      alert("Sınıf duyurusu için sınıf seçimi zorunludur.");
      return;
    }

    try {
      await announcementsService.create({ title, body, scope, className });
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    }
  }

  async function remove(id) {
    if (!confirm("Bu duyuruyu silmek istiyor musunuz?")) return;
    try {
      await announcementsService.remove(id);
      await reload();
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Duyurular</h1>
          <p className="muted">Duyuru oluşturma ve listeleme. Yeni duyuru bildirim merkezine düşer.</p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            Yeni duyuru
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="page-header" style={{ marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: 0 }}>Yeni duyuru</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Kapsam: genel veya sınıf bazlı.
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeForm}>
                İptal
              </button>
              <button className="btn btn-primary" type="button" onClick={save}>
                Yayınla
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Başlık
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              İçerik
              <textarea
                rows={5}
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
              />
            </label>
            <label>
              Kapsam
              <select className="input" value={form.scope} onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))}>
                <option value="ALL">Genel</option>
                <option value="CLASS">Sınıf</option>
              </select>
            </label>
            {form.scope === "CLASS" ? (
              <label>
                Sınıf
                <select className="input" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}>
                  {classOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="card card-elevated">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Duyuru</th>
                <th>Kapsam</th>
                <th>Tarih</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Yükleniyor…
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((r) => (
                <tr key={r.id} className="clickable-row" onClick={() => setDetailItem(r)}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {r.body.length > 80 ? `${r.body.slice(0, 80)}…` : r.body}
                    </div>
                  </td>
                  <td>
                    {r.scope === "ALL" ? (
                      <span className="pill primary">Genel</span>
                    ) : (
                      <span className="pill primary">Sınıf: {r.className}</span>
                    )}
                  </td>
                  <td className="muted">{formatDateTime(r.createdAt)}</td>
                  <td style={{ width: 120 }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-danger" type="button" onClick={() => remove(r.id)}>
                      Sil
                    </button>
                  </td>
                </tr>
                  ))
                : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <AnnouncementDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}
