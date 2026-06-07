import { apiRequest } from "../httpClient";
import { writeStoredSession } from "../../auth/storage";
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
    linkedStudentId: u.linkedStudentId != null ? String(u.linkedStudentId) : undefined
  };
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

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST", body: "{}" });
  } catch {
    /* ignore */
  }
  return { ok: true };
}
