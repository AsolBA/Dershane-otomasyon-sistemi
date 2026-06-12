import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useAuth } from "../auth/AuthContext";
import { notificationsService } from "../services";

function resetStatusLabel(row) {
  if (row.type === "password_reset_approved" || row.resetRequestStatus === "approved") {
    return "Talep onaylandı";
  }
  if (row.type === "password_reset_rejected" || row.resetRequestStatus === "rejected") {
    return "Talep reddedildi";
  }
  return null;
}

function isPendingResetRequest(row, isAdmin) {
  if (!isAdmin) return false;
  if (row.type === "password_reset_request" && row.resetRequestStatus === "pending") return true;
  if (row.type === "password_reset_request" && !row.resetRequestStatus) return true;
  return false;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.DIRECTOR;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await notificationsService.list());
      setSelectedIds([]);
    } catch (err) {
      alert(err?.message || "Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const unreadCount = useMemo(() => rows.filter((r) => !r.read).length, [rows]);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : rows.map((r) => r.id));
  }

  async function markRead(id) {
    try {
      await notificationsService.markRead(id);
      await reload();
    } catch (err) {
      alert(err?.message || "İşlem başarısız.");
    }
  }

  async function markAllRead() {
    try {
      await notificationsService.markAllRead();
      await reload();
    } catch (err) {
      alert(err?.message || "İşlem başarısız.");
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!confirm(`${selectedIds.length} bildirim kalıcı olarak silinsin mi?`)) return;
    try {
      await notificationsService.removeMany(selectedIds);
      await reload();
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  async function approveReset(refId, notificationId) {
    if (!confirm("Şifre ChangeMe123! olarak sıfırlansın mı? Kullanıcı ilk girişte yeni şifre belirleyecek.")) {
      return;
    }
    setActingId(notificationId);
    try {
      await notificationsService.approvePasswordReset(refId);
      await reload();
      alert("Talep onaylandı. Kullanıcı varsayılan şifre ile giriş yapabilir.");
    } catch (err) {
      alert(err?.message || "Onay başarısız.");
    } finally {
      setActingId(null);
    }
  }

  async function rejectReset(refId, notificationId) {
    if (!confirm("Şifre sıfırlama talebi reddedilsin mi?")) return;
    setActingId(notificationId);
    try {
      await notificationsService.rejectPasswordReset(refId);
      await reload();
    } catch (err) {
      alert(err?.message || "Reddetme başarısız.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Bildirimler</h1>
          <p className="muted">
            Okunmamış: <strong>{unreadCount}</strong>
            {selectedIds.length ? (
              <>
                {" "}
                · Seçili: <strong>{selectedIds.length}</strong>
              </>
            ) : null}
          </p>
        </div>
        <div className="toolbar">
          <button className="btn btn-danger" type="button" onClick={deleteSelected} disabled={!selectedIds.length}>
            Seçilenleri sil
          </button>
          <button className="btn" type="button" onClick={markAllRead} disabled={unreadCount === 0}>
            Tümünü okundu yap
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
                <th style={{ width: 44 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Tümünü seç" />
                </th>
                <th>Bildirim</th>
                <th>Durum</th>
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
                ? rows.map((r) => {
                    const pendingReset = isPendingResetRequest(r, isAdmin);
                    const resolvedLabel = resetStatusLabel(r);
                    const busy = actingId === r.id;
                    return (
                      <tr key={r.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r.id)}
                            onChange={() => toggleSelect(r.id)}
                            aria-label="Bildirim seç"
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: r.read ? 600 : 800 }}>{r.title}</div>
                          <div className="muted">{r.body}</div>
                        </td>
                        <td>
                          {resolvedLabel ? (
                            <span className={`pill ${resolvedLabel === "Talep onaylandı" ? "ok" : "bad"}`}>
                              {resolvedLabel}
                            </span>
                          ) : r.read ? (
                            <span className="pill ok">Okundu</span>
                          ) : (
                            <span className="pill bad">Okunmadı</span>
                          )}
                        </td>
                        <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                        <td style={{ width: pendingReset ? 280 : 200 }}>
                          {pendingReset ? (
                            <div className="row-actions">
                              <button
                                className="btn btn-primary"
                                type="button"
                                disabled={busy}
                                onClick={() => approveReset(r.refId, r.id)}
                              >
                                Onayla
                              </button>
                              <button
                                className="btn btn-danger"
                                type="button"
                                disabled={busy}
                                onClick={() => rejectReset(r.refId, r.id)}
                              >
                                Reddet
                              </button>
                            </div>
                          ) : !resolvedLabel ? (
                            <button className="btn btn-primary" type="button" disabled={r.read} onClick={() => markRead(r.id)}>
                              Okundu
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
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
