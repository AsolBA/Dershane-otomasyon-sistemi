import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ChangePasswordForm from "../components/ChangePasswordForm";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.mustChangePassword) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user && !user.mustChangePassword) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark lg">D</span>
          <div>
            <h1>Şifrenizi değiştirin</h1>
            <p className="muted">
              {user?.email ? `${user.email} — ` : ""}
              İlk girişte güvenliğiniz için yeni bir şifre belirlemeniz gerekir.
            </p>
          </div>
        </div>

        <ChangePasswordForm showLogout onSuccess={() => navigate("/dashboard", { replace: true })} />
      </div>
    </div>
  );
}
