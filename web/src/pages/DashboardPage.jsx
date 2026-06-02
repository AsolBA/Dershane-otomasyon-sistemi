import { Link } from "react-router-dom";
import { ROLES, useAuth } from "../auth/AuthContext";
import { roleLabel } from "../utils/labels";

const ICONS = {
  "/students": "👥",
  "/teachers": "👨‍🏫",
  "/classes": "🏫",
  "/courses": "📚",
  "/schedules": "📅",
  "/attendance": "✓",
  "/exams": "📝",
  "/announcements": "📢",
  "/notifications": "🔔"
};

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
      { to: "/schedules", label: "Program", desc: "Ders programı" },
      { to: "/announcements", label: "Duyurular", desc: "Duyuru yayınla" }
    ];
  }
  return [
    { to: "/students", label: "Öğrenciler", desc: "Kayıt ve sınıf bilgileri" },
    { to: "/schedules", label: "Program", desc: "Ders programı yönetimi" },
    { to: "/exams", label: "Sınavlar", desc: "Sınav ve sonuçlar" },
    { to: "/announcements", label: "Duyurular", desc: "Kurum duyuruları" }
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const links = quickLinksForRole(user?.role);

  return (
    <section>
      <div className="welcome-banner">
        <h1>Hoş geldiniz, {user?.name?.split(" ")[0] || "kullanıcı"}</h1>
        <p>
          {roleLabel(user?.role)} · Hızlı erişim kartlarından modüllere geçebilirsiniz.
        </p>
      </div>

      <div className="dashboard-grid">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className="dashboard-card">
            <div className="dashboard-card-icon">{ICONS[item.to] || "→"}</div>
            <h3>{item.label}</h3>
            <p className="muted">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
