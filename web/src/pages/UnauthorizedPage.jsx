import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="center-page">
      <h1>Yetkisiz erişim</h1>
      <p className="muted">Bu sayfaya erişim yetkiniz yok.</p>
      <Link className="text-link" to="/dashboard">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
