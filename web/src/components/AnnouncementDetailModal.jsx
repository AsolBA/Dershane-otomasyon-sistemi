import { formatAnnouncementScope, formatDateTime } from "../utils/labels";

export default function AnnouncementDetailModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.title}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            Kapat
          </button>
        </div>
        <p className="modal-body">{item.body}</p>
        <div className="modal-meta">
          <span className="pill primary">{formatAnnouncementScope(item.scope, item.className)}</span>
          <span style={{ marginLeft: 12 }}>{formatDateTime(item.createdAt)}</span>
          {item.author ? <span style={{ display: "block", marginTop: 8 }}>Yayınlayan: {item.author}</span> : null}
        </div>
      </div>
    </div>
  );
}
