// =============================================================================
// modules/auth/auth.routes.js — Kimlik dogrulama URL'leri
// POST /api/auth/login, /refresh, /logout — bunlar token gerektirmez.
// =============================================================================
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { login, logout, refresh, changePassword, forgotPassword } from "./auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", authenticate, changePassword);

export default router;
