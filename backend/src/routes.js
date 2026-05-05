import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import { authenticate, authorize } from "./middlewares/auth.js";
import { sendSuccess } from "./utils/api-response.js";

const router = Router();

router.use("/auth", authRoutes);

router.get("/me", authenticate, (req, res) => {
  return sendSuccess(res, { user: req.user });
});

router.get("/admin/ping", authenticate, authorize("admin"), (_req, res) => {
  return sendSuccess(res, { ok: true }, "Admin endpoint erisimi basarili.");
});

export default router;
