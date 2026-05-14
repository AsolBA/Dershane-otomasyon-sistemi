import { useMemo, useState } from "react";
import { createId, initialAnnouncements, initialClasses } from "../services/mock/mockStore";

const emptyForm = {
  title: "",
  body: "",
  scope: "ALL",
  className: "12-A"
};

function emitNotification(detail) {
  window.dispatchEvent(new CustomEvent("dershane:notifications-add", { detail }));
}

export default function AnnouncementsPage() {
  const [rows, setRows] = useState(initialAnnouncements);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const classOptions = useMemo(() => initialClasses.filter((c) => c.active).map((c) => c.name), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!q) return true;
      const haystack = `${r.title} ${r.body} ${r.scope} ${r.className || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
  }

  function save() {
    const title = form.title.trim();
    const body = form.body.trim();
    const scope = form.scope === "CLASS" ? "CLASS" : "ALL";
    const className = scope === "CLASS" ? String(form.className || "").trim() : "";

    if (!title || !body) {
      alert("Baslik ve icerik zorunlu.");
      return;
    }
    if (scope === "CLASS" && !className) {
      alert("Sinif duyurusu icin sinif secimi zorunlu.");
      return;
    }

    const createdAt = new Date().toISOString();
    const row = {
      id: createId("ann"),
      title,
      body,
      scope,
      className,
      createdAt
    };

    setRows((prev) => [row, ...prev]);

    emitNotification({
      id: createId("ntf"),
      title: "Yeni duyuru",
      body: title,
      read: false,
      createdAt
    });

    closeForm();
  }

  function remove(id) {
    if (!confirm("Bu duyuruyu silmek istiyor musun?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Duyurular</h1>
          <p className="muted">Duyuru olusturma + listeleme (mock). Yeni duyuru bildirim merkezine duser.</p>
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
                Kapsam: genel veya sinif bazli.
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeForm}>
                Iptal
              </button>
              <button className="btn btn-primary" type="button" onClick={save}>
                Yayinla
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Baslik
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              Icerik
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
                <option value="CLASS">Sinif</option>
              </select>
            </label>
            {form.scope === "CLASS" ? (
              <label>
                Sinif
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

      <div className="card">
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
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                      {r.body}
                    </div>
                  </td>
                  <td>
                    {r.scope === "ALL" ? (
                      <span className="pill">Genel</span>
                    ) : (
                      <span className="pill">
                        Sinif: <strong>{r.className}</strong>
                      </span>
                    )}
                  </td>
                  <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                  <td style={{ width: 120 }}>
                    <button className="btn btn-danger" type="button" onClick={() => remove(r.id)}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
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
    </section>
  );
}
