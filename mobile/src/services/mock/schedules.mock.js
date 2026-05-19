import { initialSchedules } from "./mockStore";

export async function listForClass(className) {
  return initialSchedules.filter((s) => s.className === className);
}
