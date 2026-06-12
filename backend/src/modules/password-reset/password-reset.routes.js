import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./password-reset.controller.js";

const router = Router();
const manage = authorize("admin", "manager");

router.patch("/:id/approve", authenticate, manage, ctrl.approve);
router.patch("/:id/reject", authenticate, manage, ctrl.reject);

export default router;
