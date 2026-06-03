import { apiRequest } from "../httpClient";
import { writeStoredSession } from "../../auth/storage";

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  const user = {
    id: String(data.user?.id),
    email: data.user?.email ?? email,
    name: data.user?.fullName || data.user?.email,
    role: String(data.user?.role || "").toUpperCase(),
    className: data.user?.className,
    linkedStudentId: data.user?.linkedStudentId
  };

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
