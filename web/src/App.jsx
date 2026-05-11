import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import RoleGate from "./components/RoleGate";
import { ROLES } from "./auth/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AttendancePage from "./pages/AttendancePage";
import ClassesPage from "./pages/ClassesPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import ExamsPage from "./pages/ExamsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import SchedulesPage from "./pages/SchedulesPage";
import StudentsPage from "./pages/StudentsPage";
import TeachersPage from "./pages/TeachersPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RoleGate allow={[ROLES.ADMIN, ROLES.DIRECTOR]} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<RoleGate allow={[ROLES.ADMIN, ROLES.DIRECTOR, ROLES.TEACHER]} />}>
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
          </Route>

          <Route element={<RoleGate allow={[ROLES.ADMIN, ROLES.DIRECTOR, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]} />}>
            <Route path="/exams" element={<ExamsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
