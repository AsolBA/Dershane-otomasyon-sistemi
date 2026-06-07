import { writeStoredSession, clearStoredSession } from "../../auth/storage.js";
import { apiRequest } from "../httpClient.js";
import { apiRoleToUi } from "../roleMap.js";

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  const u = data.user ?? {};
  const user = {
    id: String(u.id ?? data.userId),
    email: u.email ?? email,
    name:
      u.name ||
      u.fullName ||
      `${u.firstName || u.first_name || ""} ${u.lastName || u.last_name || ""}`.trim(),
    role: apiRoleToUi(u.role),
    studentId: u.studentId != null ? String(u.studentId) : undefined,
    className: u.className || "",
    linkedStudentId: u.linkedStudentId != null ? String(u.linkedStudentId) : undefined
  };

  writeStoredSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user
  });

  return { accessToken: data.accessToken, refreshToken: data.refreshToken, user };
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST", body: "{}" });
  } finally {
    clearStoredSession();
  }
  return { ok: true };
}
