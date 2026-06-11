import { useEffect, useRef, useState } from "react";
import { announcementsService } from "../services";
import { formatAnnouncementScope } from "../utils/labels";

function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AnnouncementDetailModal({ item, canManage, onClose, onUpdated }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState(item?.attachments ?? []);

  useEffect(() => {
    setAttachments(item?.attachments ?? []);
  }, [item]);

  if (!item) return null;

  async function downloadAttachment(att) {
    try {
      await announcementsService.downloadAttachment(item.id, att.id, att.name);
    } catch (err) {
      alert(err?.message || "Dosya indirilemedi.");
    }
  }

  async function uploadFiles(fileList) {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const added = await announcementsService.uploadAttachments(item.id, fileList);
      setAttachments((prev) => [...prev, ...added]);
      onUpdated?.();
    } catch (err) {
      alert(err?.message || "Ek yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Duyuru detayı</div>
            <h2 id="announcement-modal-title" style={{ margin: 0 }}>
              {item.title}
            </h2>
          </div>
          <button className="btn" type="button" onClick={onClose}>
            Kapat
          </button>
        </div>

        <div className="modal-meta">
          <span className="pill">{formatAnnouncementScope(item.scope, item.className)}</span>
          <span className="muted">{new Date(item.createdAt).toLocaleString()}</span>
        </div>

        <div className="modal-body">{item.body}</div>

        <div className="modal-section">
          <div className="modal-section-title">Ekler</div>
          {attachments.length === 0 ? <p className="muted">Ek dosya yok.</p> : null}
          <ul className="attachment-list">
            {attachments.map((att) => (
              <li key={att.id}>
                <button className="attachment-link" type="button" onClick={() => downloadAttachment(att)}>
                  <span>{att.name}</span>
                  <span className="muted">{formatFileSize(att.size)}</span>
                </button>
              </li>
            ))}
          </ul>

          {canManage ? (
            <div style={{ marginTop: 12 }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => uploadFiles(e.target.files)}
              />
              <button
                className="btn btn-primary"
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Yükleniyor…" : "Ek dosya ekle"}
              </button>
              <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                PDF, Word, Excel veya görsel (en fazla 5 dosya, 10 MB)
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
