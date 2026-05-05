import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./courses.controller.js";

const router = Router();
const manage = authorize("admin", "manager");
const readers = authorize("admin", "manager", "teacher", "student", "parent");

router.get("/", authenticate, readers, ctrl.list);
router.post("/", authenticate, manage, ctrl.create);
router.get("/by-class/:classId", authenticate, readers, ctrl.classCourses);
router.post("/by-class/:classId", authenticate, manage, ctrl.attachClass);
router.delete("/by-class/:classId/:courseId", authenticate, manage, ctrl.detachClass);
router.get("/:id", authenticate, readers, ctrl.getById);
router.patch("/:id", authenticate, manage, ctrl.update);
router.delete("/:id", authenticate, manage, ctrl.remove);

export default router;
