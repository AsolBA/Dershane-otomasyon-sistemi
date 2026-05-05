import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./classes.controller.js";

const router = Router();
const manage = authorize("admin", "manager");
const readers = authorize("admin", "manager", "teacher", "student", "parent");

router.get("/", authenticate, readers, ctrl.list);
router.get("/:id", authenticate, readers, ctrl.getById);
router.get("/:id/students", authenticate, readers, ctrl.students);
router.post("/", authenticate, manage, ctrl.create);
router.patch("/:id", authenticate, manage, ctrl.update);
router.delete("/:id", authenticate, manage, ctrl.remove);

export default router;
