import { writeStoredSession, clearStoredSession } from "../../auth/storage.js";
import { apiRequest } from "../httpClient.js";
import { apiRoleToUi } from "../roleMap.js";

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  const user = {
    id: String(data.user?.id ?? data.userId),
    email: data.user?.email ?? email,
    name: data.user?.fullName || `${data.user?.first_name || ""} ${data.user?.last_name || ""}`.trim(),
    role: apiRoleToUi(data.user?.role)
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
