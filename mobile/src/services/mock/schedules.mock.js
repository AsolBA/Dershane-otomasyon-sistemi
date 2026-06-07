import { initialSchedules } from "./mockStore";

export async function list({ day } = {}) {
  let rows = [...initialSchedules];
  if (day && day !== "ALL") rows = rows.filter((s) => s.day === day);
  return rows;
}

export async function listForClass(className) {
  if (!className) return list({});
  return initialSchedules.filter((s) => s.className === className);
}
