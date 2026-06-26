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

/** Branş adı ile ders adını eşleştirir (ör. Matematik öğretmeni → Matematik dersi). */
export function coursesForBranch(courses = [], branch) {
  const normalized = String(branch || "").trim().toLocaleLowerCase("tr");
  if (!normalized) return [];
  return courses.filter((c) => String(c.name || "").trim().toLocaleLowerCase("tr") === normalized);
}
