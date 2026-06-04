// modules/attendance/* — Yoklama kayit ve rapor API
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./attendance.controller.js";

const router = Router();
const markRoles = authorize("admin", "manager", "teacher");
const reportRoles = authorize("admin", "manager", "teacher");

router.get("/report", authenticate, reportRoles, ctrl.report);
router.get("/", authenticate, ctrl.list);
router.post("/mark", authenticate, markRoles, ctrl.mark);
router.patch("/:id", authenticate, markRoles, ctrl.patch);

export default router;
