import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RoleGate({ allow }) {
  const { user } = useAuth();
  const role = user?.role;

  if (!role) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
