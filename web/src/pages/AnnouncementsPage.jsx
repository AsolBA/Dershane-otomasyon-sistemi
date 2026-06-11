import { useCallback, useEffect, useRef, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import AnnouncementDetailModal from "../components/AnnouncementDetailModal";
import { announcementsService, classesService } from "../services";

const MANAGE_ROLES = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.TEACHER];

const emptyForm = {
  title: "",
  body: "",
  scope: "ALL",
  className: "12-A"
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const canManage = MANAGE_ROLES.includes(user?.role);
  const createFileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classOptions, setClassOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

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
    setPendingFiles([]);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setPendingFiles([]);
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

    setSaving(true);
    try {
      await announcementsService.create({ title, body, scope, className, files: pendingFiles });
      await reload();
      closeForm();
    } catch (err) {
      alert(err?.message || "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id, e) {
    e?.stopPropagation();
    if (!confirm("Bu duyuruyu silmek istiyor musunuz?")) return;
    try {
      await announcementsService.remove(id);
      if (String(selected?.id) === String(id)) setSelected(null);
      await reload();
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  function openDetail(row) {
    setSelected(row);
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Duyurular</h1>
          <p className="muted">
            {canManage
              ? "Duyuru oluşturma, ek dosya ve listeleme. Detay için satıra tıklayın."
              : "Duyuruları görmek için satıra tıklayın."}
          </p>
        </div>
        <div className="toolbar">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara..." />
          {canManage ? (
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Yeni duyuru
            </button>
          ) : null}
        </div>
      </div>

      {canManage && showForm ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="page-header" style={{ marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: 0 }}>Yeni duyuru</h2>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Kapsam: genel veya sınıf bazlı. PDF, Word vb. ekleyebilirsiniz.
              </p>
            </div>
            <div className="toolbar">
              <button className="btn" type="button" onClick={closeForm}>
                İptal
              </button>
              <button className="btn btn-primary" type="button" onClick={save} disabled={saving}>
                {saving ? "Yayınlanıyor…" : "Yayınla"}
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
            <label style={{ gridColumn: "1 / -1" }}>
              Ek dosyalar (isteğe bağlı)
              <input
                ref={createFileRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => setPendingFiles(Array.from(e.target.files || []))}
              />
              {pendingFiles.length ? (
                <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                  {pendingFiles.map((f) => f.name).join(", ")}
                </div>
              ) : null}
            </label>
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
                <th>Ek</th>
                <th>Tarih</th>
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
                    <tr
                      key={r.id}
                      className="clickable-row"
                      onClick={() => openDetail(r)}
                      style={{ cursor: "pointer" }}
                    >
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
                            Sınıf: <strong>{r.className}</strong>
                          </span>
                        )}
                      </td>
                      <td className="muted">{r.attachments?.length ? `${r.attachments.length} dosya` : "—"}</td>
                      <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                      <td style={{ width: 120 }} onClick={(e) => e.stopPropagation()}>
                        {canManage ? (
                          <button className="btn btn-danger" type="button" onClick={(e) => remove(r.id, e)}>
                            Sil
                          </button>
                        ) : null}
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

      <AnnouncementDetailModal
        item={selected}
        canManage={canManage}
        onClose={() => setSelected(null)}
        onUpdated={reload}
      />
    </section>
  );
}
