import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROLES, useAuth } from "../auth/AuthContext";
import { readStoredSession } from "../auth/storage";
import { USE_MOCK_API } from "../services";

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
      const session = readStoredSession();
      const target = session.user?.mustChangePassword ? "/change-password" : from;
      navigate(target, { replace: true });
    } catch (err) {
      setError(err?.message || "Giriş başarısız. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark lg">D</span>
          <div>
            <h1>Dershane Otomasyon</h1>
            <p className="muted">{USE_MOCK_API ? "Geliştirme modu (mock giriş)" : "Hesabınızla giriş yapın"}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>E-posta</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" />
          </label>

          <label className="field">
            <span>Şifre</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          {USE_MOCK_API ? (
            <label className="field">
              <span>Rol (mock)</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value={ROLES.ADMIN}>Yönetici</option>
                <option value={ROLES.DIRECTOR}>Kurum müdürü</option>
                <option value={ROLES.TEACHER}>Öğretmen</option>
                <option value={ROLES.STUDENT}>Öğrenci</option>
                <option value={ROLES.PARENT}>Veli</option>
              </select>
            </label>
          ) : null}

          {error ? <div className="error">{error}</div> : null}

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Giriliyor…" : "Giriş yap"}
          </button>

          {!USE_MOCK_API ? (
            <Link to="/forgot-password" className="muted" style={{ marginTop: 12, display: "inline-block" }}>
              Şifremi unuttum
            </Link>
          ) : null}
        </form>
      </div>
    </div>
  );
}
