import { findScheduleConflicts, normalizeTimeInput } from "../../utils/scheduleConflict.js";
import { createId, getStore } from "./state.js";

export async function list({ day, q } = {}) {
  let rows = [...getStore().schedules];
  if (day && day !== "ALL") rows = rows.filter((r) => r.day === day);
  const query = String(q || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((r) => `${r.day} ${r.className} ${r.room} ${r.teacherId} ${r.courseId}`.toLowerCase().includes(query));
  }
  return rows;
}

export async function listForClass(className) {
  const rows = await list({ day: "ALL", q: "" });
  if (!className) return rows;
  const normalized = String(className).trim().toLowerCase();
  return rows.filter((r) => String(r.className || "").trim().toLowerCase() === normalized);
}

export async function checkConflict(candidate, ignoreId) {
  const normalized = {
    ...candidate,
    startTime: normalizeTimeInput(candidate.startTime),
    endTime: normalizeTimeInput(candidate.endTime)
  };
  return findScheduleConflicts({ rows: getStore().schedules, candidate: normalized, ignoreId });
}

export async function create(payload) {
  const normalized = {
    ...payload,
    startTime: normalizeTimeInput(payload.startTime),
    endTime: normalizeTimeInput(payload.endTime)
  };
  const check = await checkConflict(normalized);
  if (!check.ok) {
    const msg = [...check.errors, ...check.conflicts.map((c) => c.message)].join("\n");
    throw new Error(msg);
  }
  const row = { id: createId("sch"), ...normalized };
  getStore().schedules.unshift(row);
  return row;
}

export async function update(id, payload) {
  const check = await checkConflict(payload, id);
  if (!check.ok) {
    const msg = [...check.errors, ...check.conflicts.map((c) => c.message)].join("\n");
    throw new Error(msg);
  }
  const store = getStore();
  const idx = store.schedules.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Program satırı bulunamadı.");
  store.schedules[idx] = { ...store.schedules[idx], ...payload };
  return store.schedules[idx];
}

export async function remove(id) {
  getStore().schedules = getStore().schedules.filter((r) => r.id !== id);
}
