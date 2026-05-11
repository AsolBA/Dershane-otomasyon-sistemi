import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLES, useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const stateFrom = location.state?.from;
    return typeof stateFrom === "string" && stateFrom.startsWith("/") ? stateFrom : "/dashboard";
  }, [location.state]);

  const [email, setEmail] = useState("admin@dershane.local");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.ADMIN);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password, role });
      navigate(from, { replace: true });
    } catch (err) {
      setError("Giris basarisiz. Lutfen tekrar deneyin.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Giris</h1>
        <p className="muted">Simdi mock login. Sonra backend JWT ile degisecek.</p>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>E-posta</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" />
          </label>

          <label className="field">
            <span>Sifre</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          <label className="field">
            <span>Rol (mock)</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.DIRECTOR}>Kurum Muduru</option>
              <option value={ROLES.TEACHER}>Ogretmen</option>
              <option value={ROLES.STUDENT}>Ogrenci</option>
              <option value={ROLES.PARENT}>Veli</option>
            </select>
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Giriliyor..." : "Giris yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
