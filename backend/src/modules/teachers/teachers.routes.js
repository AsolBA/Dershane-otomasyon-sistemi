import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./teachers.controller.js";

const router = Router();
const manage = authorize("admin", "manager");
const readRoles = authorize("admin", "manager", "teacher");

router.get("/", authenticate, readRoles, ctrl.list);
router.post("/", authenticate, manage, ctrl.create);
router.get("/:id/courses", authenticate, readRoles, ctrl.listCourses);
router.post("/:id/courses", authenticate, manage, ctrl.addCourse);
router.delete("/:id/courses/:courseId", authenticate, manage, ctrl.removeCourse);
router.get("/:id", authenticate, readRoles, ctrl.getById);
router.patch("/:id", authenticate, manage, ctrl.update);

export default router;
