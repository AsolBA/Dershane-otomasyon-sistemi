import { useEffect, useMemo, useState } from "react";
import { initialNotifications } from "../services/mock/mockStore";

export default function NotificationsPage() {
  const [rows, setRows] = useState(initialNotifications);

  useEffect(() => {
    const onAdd = (e) => {
      const detail = e?.detail;
      if (!detail?.id) return;
      setRows((prev) => {
        if (prev.some((r) => r.id === detail.id)) return prev;
        return [detail, ...prev];
      });
    };

    window.addEventListener("dershane:notifications-add", onAdd);
    return () => window.removeEventListener("dershane:notifications-add", onAdd);
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (Boolean(a.read) !== Boolean(b.read)) return a.read ? 1 : -1;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
  }, [rows]);

  const unreadCount = useMemo(() => rows.filter((r) => !r.read).length, [rows]);

  function markRead(id) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
  }

  function markAllRead() {
    setRows((prev) => prev.map((r) => ({ ...r, read: true })));
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Bildirimler</h1>
          <p className="muted">
            Okunmamis: <strong>{unreadCount}</strong> — Duyuru yayinlayinca buraya dusen mock bildirimler.
          </p>
        </div>
        <div className="toolbar">
          <button className="btn" type="button" onClick={markAllRead} disabled={unreadCount === 0}>
            Tumunu okundu yap
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
              {sorted.map((r) => (
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
              ))}
              {sorted.length === 0 ? (
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
