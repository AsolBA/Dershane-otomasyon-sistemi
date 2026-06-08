import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import * as ctrl from "./parents.controller.js";

const router = Router();

router.get("/", authenticate, authorize("admin", "manager"), ctrl.list);

export default router;
