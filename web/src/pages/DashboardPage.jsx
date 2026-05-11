import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">
        Merhaba <strong>{user?.email}</strong>. Rol: <strong>{user?.role}</strong>
      </p>
      <p>Buradan modullere sol menuden gidebilirsin. Simdilik placeholder ekranlar.</p>
    </section>
  );
}
