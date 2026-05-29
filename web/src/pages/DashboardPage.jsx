import { Link } from "react-router-dom";
import { ROLES, useAuth } from "../auth/AuthContext";
import { roleLabel } from "../utils/labels";

function quickLinksForRole(role) {
  if (role === ROLES.STUDENT) {
    return [
      { to: "/schedules", label: "Programım", desc: "Haftalık ders programınız" },
      { to: "/exams", label: "Sonuçlarım", desc: "Sınav puanlarınız" }
    ];
  }
  if (role === ROLES.PARENT) {
    return [
      { to: "/attendance", label: "Devamsızlık", desc: "Öğrencinizin devam durumu" },
      { to: "/exams", label: "Sonuçlar", desc: "Sınav sonuçları" }
    ];
  }
  if (role === ROLES.TEACHER) {
    return [
      { to: "/attendance", label: "Yoklama", desc: "Ders yoklaması al" },
      { to: "/exams", label: "Sınavlar", desc: "Sınav ve sonuç girişi" },
      { to: "/schedules", label: "Program", desc: "Ders programı" }
    ];
  }
  return [
    { to: "/students", label: "Öğrenciler", desc: "Kayıt ve sınıf bilgileri" },
    { to: "/schedules", label: "Program", desc: "Ders programı yönetimi" },
    { to: "/exams", label: "Sınavlar", desc: "Sınav ve sonuçlar" }
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const links = quickLinksForRole(user?.role);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Hoş geldiniz</h1>
          <p className="muted">
            <strong>{user?.name}</strong> · {roleLabel(user?.role)}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="dashboard-card">
            <h3>{item.label}</h3>
            <p className="muted">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
