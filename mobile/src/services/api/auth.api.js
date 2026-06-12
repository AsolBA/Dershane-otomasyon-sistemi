import { apiRequest } from "../httpClient";
import { readStoredSession, writeStoredSession } from "../../auth/storage";
import { joinFullName } from "./mappers";
import { apiRoleToUi } from "../roleMap";

function mapLoginUser(data, email) {
  const u = data.user ?? {};
  return {
    id: String(u.id ?? data.userId),
    email: u.email ?? email,
    name:
      u.name ||
      joinFullName(u.firstName || u.first_name, u.lastName || u.last_name) ||
      u.email ||
      email,
    role: apiRoleToUi(u.role),
    studentId: u.studentId != null ? String(u.studentId) : undefined,
    className: u.className || "",
    linkedStudentId: u.linkedStudentId != null ? String(u.linkedStudentId) : undefined,
    mustChangePassword: Boolean(u.mustChangePassword ?? u.must_change_password)
  };
}

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

  const user = mapLoginUser(data, email);

  await writeStoredSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user
  });

  return { accessToken: data.accessToken, refreshToken: data.refreshToken, user };
}

export async function changePassword({ currentPassword, newPassword }) {
  const data = await apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const session = await readStoredSession();
  const u = data.user ?? {};
  const user = {
    id: String(u.id ?? session.user?.id ?? ""),
    email: u.email ?? session.user?.email,
    name:
      u.name ||
      joinFullName(u.firstName || u.first_name, u.lastName || u.last_name) ||
      session.user?.name,
    role: apiRoleToUi(u.role ?? session.user?.role),
    studentId: u.studentId != null ? String(u.studentId) : session.user?.studentId,
    className: u.className || session.user?.className || "",
    linkedStudentId:
      u.linkedStudentId != null ? String(u.linkedStudentId) : session.user?.linkedStudentId,
    mustChangePassword: Boolean(u.mustChangePassword ?? u.must_change_password)
  };

  await writeStoredSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user
  });

  return { user };
}

export async function logout() {
  const session = await readStoredSession();
  try {
    if (session.refreshToken) {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken })
      });
    }
  } catch {
    /* ignore */
  }
  return { ok: true };
}
