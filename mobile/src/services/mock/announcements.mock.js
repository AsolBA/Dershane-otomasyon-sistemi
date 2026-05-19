import { initialAnnouncements } from "./mockStore";

export async function listForUser({ role, className }) {
  return initialAnnouncements.filter((a) => {
    if (a.scope === "ALL") return true;
    return a.className === className;
  });
}
