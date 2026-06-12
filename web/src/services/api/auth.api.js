import { readStoredSession, writeStoredSession, clearStoredSession } from "../../auth/storage.js";
import { apiRequest } from "../httpClient.js";
import { apiRoleToUi } from "../roleMap.js";

export async function forgotPassword({ email }) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

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
    linkedStudentId: u.linkedStudentId != null ? String(u.linkedStudentId) : undefined,
    mustChangePassword: Boolean(u.mustChangePassword ?? u.must_change_password)
  };

  writeStoredSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user
  });

  return { accessToken: data.accessToken, refreshToken: data.refreshToken, user };
}

function mapApiUser(u, fallbackEmail = "") {
  return {
    id: String(u.id ?? ""),
    email: u.email ?? fallbackEmail,
    name:
      u.name ||
      u.fullName ||
      `${u.firstName || u.first_name || ""} ${u.lastName || u.last_name || ""}`.trim(),
    role: apiRoleToUi(u.role),
    studentId: u.studentId != null ? String(u.studentId) : undefined,
    className: u.className || "",
    linkedStudentId: u.linkedStudentId != null ? String(u.linkedStudentId) : undefined,
    mustChangePassword: Boolean(u.mustChangePassword ?? u.must_change_password)
  };
}

export async function changePassword({ currentPassword, newPassword }) {
  const data = await apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const session = readStoredSession();
  const user = data.user ? mapApiUser(data.user, session.user?.email) : session.user;

  writeStoredSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user
  });

  return { user };
}

export async function logout() {
  const session = readStoredSession();
  try {
    if (session.refreshToken) {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken })
      });
    }
  } finally {
    clearStoredSession();
  }
  return { ok: true };
}
