// modules/notifications/* — Bildirim API
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./notifications.controller.js";

const router = Router();

router.get("/me", authenticate, ctrl.listMine);
router.patch("/me/read-all", authenticate, ctrl.markReadAllMine);
router.patch("/:id/read", authenticate, ctrl.markReadNotification);
router.post("/", authenticate, authorize("admin", "manager"), ctrl.createNotification);

export default router;
