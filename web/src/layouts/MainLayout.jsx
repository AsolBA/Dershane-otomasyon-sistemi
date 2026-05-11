import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ROLES, useAuth } from "../auth/AuthContext";

function navItemsForRole(role) {
  const base = [{ to: "/dashboard", label: "Dashboard" }];

  if (role === ROLES.ADMIN || role === ROLES.DIRECTOR) {
    return [
      ...base,
      { to: "/students", label: "Ogrenciler" },
      { to: "/teachers", label: "Ogretmenler" },
      { to: "/classes", label: "Siniflar" },
      { to: "/courses", label: "Dersler" },
      { to: "/schedules", label: "Program" },
      { to: "/attendance", label: "Yoklama" },
      { to: "/exams", label: "Sinavlar" },
      { to: "/announcements", label: "Duyurular" },
      { to: "/notifications", label: "Bildirimler" }
    ];
  }

  if (role === ROLES.TEACHER) {
    return [
      ...base,
      { to: "/schedules", label: "Programim" },
      { to: "/attendance", label: "Yoklama" },
      { to: "/exams", label: "Sinavlar" },
      { to: "/announcements", label: "Duyurular" }
    ];
  }

  if (role === ROLES.STUDENT) {
    return [...base, { to: "/schedules", label: "Programim" }, { to: "/exams", label: "Sonuclarim" }];
  }

  if (role === ROLES.PARENT) {
    return [...base, { to: "/attendance", label: "Devamsizlik" }, { to: "/exams", label: "Sonuclar" }];
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
        <h2>Dershane</h2>
        <div className="user-pill">
          <div className="user-name">{user?.name || "Kullanici"}</div>
          <div className="user-role">{user?.role || "-"}</div>
        </div>
        <nav>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to}>
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
          Cikis
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
