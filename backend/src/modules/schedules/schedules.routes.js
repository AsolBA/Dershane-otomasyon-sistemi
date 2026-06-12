// modules/schedules/* — Ders programi API
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./schedules.controller.js";

const router = Router();
const manage = authorize("admin", "manager", "teacher");
const readSchedules = authorize("admin", "manager", "teacher", "student", "parent");

router.get("/", authenticate, readSchedules, ctrl.list);
router.post("/conflict-check", authenticate, manage, ctrl.conflictCheck);
router.post("/", authenticate, manage, ctrl.create);
router.get("/:id", authenticate, manage, ctrl.getById);
router.patch("/:id", authenticate, manage, ctrl.update);
router.delete("/:id", authenticate, manage, ctrl.remove);

export default router;
