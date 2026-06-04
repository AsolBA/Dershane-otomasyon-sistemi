// =============================================================================
// middlewares/rbac.js — Sik kullanilan rol kisitlamalari (kisa yollar)
// Route dosyalarinda tekrar tekrar authorize() yazmamak icin hazir middleware'ler.
// =============================================================================
import { authorize } from "./auth.js";

export const adminOrManager = authorize("admin", "manager");
export const adminManagerTeacher = authorize("admin", "manager", "teacher");
