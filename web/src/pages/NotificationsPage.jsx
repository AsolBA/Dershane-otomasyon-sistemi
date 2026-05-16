import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsService } from "../services";

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await notificationsService.list());
    } catch (err) {
      alert(err?.message || "Liste yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const unreadCount = useMemo(() => rows.filter((r) => !r.read).length, [rows]);

  async function markRead(id) {
    try {
      await notificationsService.markRead(id);
      await reload();
    } catch (err) {
      alert(err?.message || "Islem basarisiz.");
    }
  }

  async function markAllRead() {
    try {
      await notificationsService.markAllRead();
      await reload();
    } catch (err) {
      alert(err?.message || "Islem basarisiz.");
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Bildirimler</h1>
          <p className="muted">
            Okunmamis: <strong>{unreadCount}</strong>
          </p>
        </div>
        <div className="toolbar">
          <button className="btn" type="button" onClick={markAllRead} disabled={unreadCount === 0}>
            Tumunu okundu yap
          </button>
          <button className="btn" type="button" onClick={reload}>
            Yenile
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bildirim</th>
                <th>Durum</th>
                <th>Tarih</th>
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
                      <td>
                        <div style={{ fontWeight: r.read ? 600 : 800 }}>{r.title}</div>
                        <div className="muted">{r.body}</div>
                      </td>
                      <td>{r.read ? <span className="pill ok">Okundu</span> : <span className="pill bad">Okunmadi</span>}</td>
                      <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                      <td style={{ width: 160 }}>
                        <button className="btn btn-primary" type="button" disabled={r.read} onClick={() => markRead(r.id)}>
                          Okundu
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Bildirim yok.
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
