// modules/announcements/* — Duyuru API
import { Router } from "express";
import { authenticate, authenticateFlexible, authorize } from "../../middlewares/auth.js";
import { announcementUpload } from "../../utils/announcement-upload.js";
import * as ctrl from "./announcements.controller.js";

const router = Router();
const writeRoles = authorize("admin", "manager", "teacher");

router.get("/", authenticate, ctrl.listAnnouncements);
router.post("/", authenticate, writeRoles, ctrl.createAnnouncement);

router.get(
  "/:id/attachments/:attachmentId/file",
  authenticateFlexible,
  ctrl.downloadAttachment,
);
router.post(
  "/:id/attachments",
  authenticate,
  writeRoles,
  announcementUpload.array("files", 5),
  ctrl.uploadAttachments,
);

router.get("/:id", authenticate, ctrl.getAnnouncement);
router.patch("/:id", authenticate, writeRoles, ctrl.updateAnnouncement);
router.delete("/:id", authenticate, writeRoles, ctrl.deleteAnnouncement);

export default router;
