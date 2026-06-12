import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { validateNewPassword } from "../utils/passwordPolicy";

export default function ChangePasswordForm({ onSuccess, showLogout = false }) {
  const { user, changePassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    const policy = validateNewPassword(newPassword);
    if (!policy.ok) {
      setError(policy.errors.join(" "));
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Şifreniz güncellendi.");
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Şifre güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form" style={{ maxWidth: 420 }}>
      {user?.email ? (
        <p className="muted" style={{ marginTop: 0 }}>
          Hesap: <strong>{user.email}</strong>
        </p>
      ) : null}

      <label className="field">
        <span>Mevcut şifre</span>
        <input
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      <label className="field">
        <span>Yeni şifre</span>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          required
        />
      </label>

      <label className="field">
        <span>Yeni şifre (tekrar)</span>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          required
        />
      </label>

      <p className="muted" style={{ fontSize: 13, margin: 0 }}>
        En az 8 karakter; büyük harf, küçük harf ve rakam içermeli. Varsayılan şifre kullanılamaz.
      </p>

      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="pill ok" style={{ display: "inline-block" }}>{success}</div> : null}

      <button className="primary" type="submit" disabled={submitting}>
        {submitting ? "Kaydediliyor…" : "Şifreyi güncelle"}
      </button>

      {showLogout ? (
        <button className="btn" type="button" onClick={() => logout()} style={{ marginTop: 8 }}>
          Çıkış yap
        </button>
      ) : null}
    </form>
  );
}
