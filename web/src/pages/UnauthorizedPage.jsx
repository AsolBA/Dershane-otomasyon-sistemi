import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="center-page">
      <h1>Yetkisiz</h1>
      <p className="muted">Bu sayfaya erisim yetkin yok.</p>
      <Link to="/dashboard">Dashboard'a don</Link>
    </div>
  );
}
