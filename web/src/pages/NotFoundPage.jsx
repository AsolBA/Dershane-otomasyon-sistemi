import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section>
      <h1>Sayfa bulunamadi</h1>
      <Link to="/dashboard">Dashboard'a don</Link>
    </section>
  );
}
