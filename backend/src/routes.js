// =============================================================================
// routes.js — API route haritasi
// Tum modullerin URL prefix'leri burada toplanir (/api/auth, /api/students...).
// /api/me = giris yapmış kullanicinin profili. /api/admin/ping = sadece admin test endpoint'i.
// =============================================================================
import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import studentsRoutes from "./modules/students/students.routes.js";
import parentsRoutes from "./modules/parents/parents.routes.js";
import teachersRoutes from "./modules/teachers/teachers.routes.js";
import classesRoutes from "./modules/classes/classes.routes.js";
import coursesRoutes from "./modules/courses/courses.routes.js";
import schedulesRoutes from "./modules/schedules/schedules.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import examsRoutes from "./modules/exams/exams.routes.js";
import announcementsRoutes from "./modules/announcements/announcements.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import passwordResetRoutes from "./modules/password-reset/password-reset.routes.js";
import { authenticate, authorize } from "./middlewares/auth.js";
import { sendSuccess } from "./utils/api-response.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/students", studentsRoutes);
router.use("/parents", parentsRoutes);
router.use("/teachers", teachersRoutes);
router.use("/classes", classesRoutes);
router.use("/courses", coursesRoutes);
router.use("/schedules", schedulesRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/exams", examsRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/password-reset-requests", passwordResetRoutes);

router.get("/me", authenticate, (req, res) => {
  return sendSuccess(res, { user: req.user });
});

router.get("/admin/ping", authenticate, authorize("admin"), (_req, res) => {
  return sendSuccess(res, { ok: true }, "Admin endpoint erisimi basarili.");
});

export default router;
