// =============================================================================
// modules/students/students.routes.js — Ogrenci API URL'leri
// GET/POST /api/students, GET/PATCH /api/students/:id. Rol: admin/manager CRUD yapar.
// =============================================================================
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./students.controller.js";

const router = Router();
const manageStudents = authorize("admin", "manager");
const enrollRoles = authorize("admin", "manager", "teacher");

router.get("/", authenticate, ctrl.list);
router.post("/", authenticate, manageStudents, ctrl.create);
router.post("/:id/classes", authenticate, enrollRoles, ctrl.addClass);
router.delete("/:id/classes/:classId", authenticate, enrollRoles, ctrl.removeClass);
router.get("/:id", authenticate, ctrl.getById);
router.patch("/:id", authenticate, manageStudents, ctrl.update);

export default router;
