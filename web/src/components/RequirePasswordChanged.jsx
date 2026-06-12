import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequirePasswordChanged() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
