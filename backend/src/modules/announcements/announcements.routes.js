import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./announcements.controller.js";

const router = Router();
const writeRoles = authorize("admin", "manager", "teacher");

router.get("/", authenticate, ctrl.listAnnouncements);
router.get("/:id", authenticate, ctrl.getAnnouncement);
router.post("/", authenticate, writeRoles, ctrl.createAnnouncement);
router.patch("/:id", authenticate, writeRoles, ctrl.updateAnnouncement);
router.delete("/:id", authenticate, writeRoles, ctrl.deleteAnnouncement);

export default router;
