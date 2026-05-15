import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { adminOrManager } from "../../middlewares/rbac.js";
import * as ctrl from "./users.controller.js";

const router = Router();

router.get("/", authenticate, adminOrManager, ctrl.list);
router.get("/:id", authenticate, ctrl.getById);
router.post("/", authenticate, adminOrManager, ctrl.create);
router.patch("/:id", authenticate, adminOrManager, ctrl.update);
router.delete("/:id", authenticate, adminOrManager, ctrl.remove);

export default router;
