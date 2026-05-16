import { writeStoredSession } from "../../auth/storage.js";
import { apiRoleToUi } from "../roleMap.js";

export async function login({ email, password, role }) {
  const safeEmail = email?.trim() || "demo@dershane.local";
  const safeRole = apiRoleToUi(role || "TEACHER");

  const accessToken = `mock_access_${safeRole.toLowerCase()}`;
  const refreshToken = `mock_refresh_${safeRole.toLowerCase()}`;

  const user = {
    id: "mock-user-id",
    email: safeEmail,
    name: "Demo Kullanici",
    role: safeRole
  };

  writeStoredSession({ accessToken, refreshToken, user });
  return { accessToken, refreshToken, user };
}

export async function logout() {
  return { ok: true };
}
