import { NavLink, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Dershane</h2>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
