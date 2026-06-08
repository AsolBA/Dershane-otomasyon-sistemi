import { TEACHER_BRANCHES } from "./constants.js";

export function mergeTeacherBranches({ courses = [], teachers = [] } = {}) {
  const set = new Set(TEACHER_BRANCHES);
  for (const c of courses) {
    const name = String(c.name || "").trim();
    if (name) set.add(name);
  }
  for (const t of teachers) {
    const branch = String(t.branch || "").trim();
    if (branch) set.add(branch);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}
