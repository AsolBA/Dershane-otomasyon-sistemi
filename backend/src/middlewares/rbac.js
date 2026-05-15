import { authorize } from "./auth.js";

export const adminOrManager = authorize("admin", "manager");
export const adminManagerTeacher = authorize("admin", "manager", "teacher");
