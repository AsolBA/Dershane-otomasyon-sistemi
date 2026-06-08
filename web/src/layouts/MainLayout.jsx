import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ROLES, useAuth } from "../auth/AuthContext";
import { roleLabel } from "../utils/labels";

function navItemsForRole(role) {
  const base = [{ to: "/dashboard", label: "Ana sayfa" }];

  if (role === ROLES.ADMIN || role === ROLES.DIRECTOR) {
    return [
      ...base,
      { to: "/students", label: "Öğrenciler" },
      { to: "/teachers", label: "Öğretmenler" },
      { to: "/classes", label: "Sınıflar" },
      { to: "/courses", label: "Dersler" },
      { to: "/schedules", label: "Program" },
      { to: "/attendance", label: "Yoklama" },
      { to: "/exams", label: "Sınavlar" },
      { to: "/announcements", label: "Duyurular" },
      { to: "/notifications", label: "Bildirimler" }
    ];
  }

  if (role === ROLES.TEACHER) {
    return [
      ...base,
      { to: "/schedules", label: "Programım" },
      { to: "/attendance", label: "Yoklama" },
      { to: "/exams", label: "Sınavlar" },
      { to: "/announcements", label: "Duyurular" }
    ];
  }

  if (role === ROLES.STUDENT) {
    return [
      ...base,
      { to: "/schedules", label: "Programım" },
      { to: "/exams", label: "Sonuçlarım" },
      { to: "/announcements", label: "Duyurular" },
      { to: "/notifications", label: "Bildirimler" }
    ];
  }

  if (role === ROLES.PARENT) {
    return [
      ...base,
      { to: "/attendance", label: "Devamsızlık" },
      { to: "/exams", label: "Sonuçlar" },
      { to: "/announcements", label: "Duyurular" },
      { to: "/notifications", label: "Bildirimler" }
    ];
  }

  return base;
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = navItemsForRole(user?.role);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">D</span>
          <div>
            <div className="brand-title">Dershane</div>
            <div className="brand-sub">Otomasyon Paneli</div>
          </div>
        </div>

        <div className="user-pill">
          <div className="user-name">{user?.name || "Kullanıcı"}</div>
          <div className="user-role">{roleLabel(user?.role)}</div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="logout"
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Çıkış yap
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
