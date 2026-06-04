// =============================================================================
// modules/auth/auth.routes.js — Kimlik dogrulama URL'leri
// POST /api/auth/login, /refresh, /logout — bunlar token gerektirmez.
// =============================================================================
import { Router } from "express";
import { login, logout, refresh } from "./auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
