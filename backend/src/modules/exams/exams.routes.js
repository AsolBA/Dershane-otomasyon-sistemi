import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./exams.controller.js";

const router = Router();
const writeExam = authorize("admin", "manager", "teacher");
const writeResults = authorize("admin", "manager", "teacher");

router.get("/", authenticate, ctrl.listExams);
router.post("/", authenticate, writeExam, ctrl.createExam);

router.get("/:examId/results", authenticate, ctrl.listResults);
router.post("/:examId/results", authenticate, writeResults, ctrl.upsertResult);
router.patch("/:examId/results/:resultId", authenticate, writeResults, ctrl.updateResult);
router.delete("/:examId/results/:resultId", authenticate, writeResults, ctrl.deleteResult);

router.get("/:examId", authenticate, ctrl.getExam);
router.patch("/:examId", authenticate, writeExam, ctrl.updateExam);
router.delete("/:examId", authenticate, writeExam, ctrl.deleteExam);

export default router;
