import ChangePasswordForm from "../components/ChangePasswordForm";

export default function SettingsPage() {
  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Ayarlar</h1>
          <p className="muted">Hesap ve güvenlik tercihleriniz.</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 6px" }}>Şifre değiştir</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          Mevcut şifrenizi girerek yeni bir şifre belirleyebilirsiniz.
        </p>
        <ChangePasswordForm />
      </div>
    </section>
  );
}
