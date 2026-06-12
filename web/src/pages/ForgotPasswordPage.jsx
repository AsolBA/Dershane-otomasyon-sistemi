import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSuccess(
        "Talebiniz yöneticiye iletildi. Onaylandıktan sonra ChangeMe123! ile giriş yapabilir ve yeni şifre belirleyebilirsiniz."
      );
    } catch (err) {
      setError(err?.message || "Talep gönderilemedi.");
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
            <h1>Şifremi unuttum</h1>
            <p className="muted">E-posta adresinizi girin. Yönetici onayından sonra şifreniz sıfırlanır.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>E-posta</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              required
            />
          </label>

          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="pill ok" style={{ display: "block" }}>{success}</div> : null}

          <button className="primary" type="submit" disabled={submitting || Boolean(success)}>
            {submitting ? "Gönderiliyor…" : "Yöneticiye talep gönder"}
          </button>

          <Link to="/login" className="muted" style={{ marginTop: 12, display: "inline-block" }}>
            Girişe dön
          </Link>
        </form>
      </div>
    </div>
  );
}
