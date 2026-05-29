import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Sayfa bulunamadı</h1>
      <Link to="/dashboard">Ana sayfaya dön</Link>
    </section>
  );
}
