import { apiRequest } from "../httpClient";
import { writeStoredSession } from "../../auth/storage";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

function mapLoginUser(data, email) {
  const firstName = data.user?.firstName ?? data.user?.first_name ?? "";
  const lastName = data.user?.lastName ?? data.user?.last_name ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    id: String(data.user?.id),
    email: data.user?.email ?? email,
    name: name || data.user?.email || email,
    role: String(data.user?.role || "").toUpperCase(),
    className: data.user?.className,
    linkedStudentId: data.user?.linkedStudentId
  };
}

async function attachStudentContext(user) {
  if (user.role !== "PARENT" && user.role !== "STUDENT") return user;

  try {
    const data = await apiRequest("/students?limit=5");
    const item = unwrapList(data)[0];
    if (!item) return user;

    user.linkedStudentId = String(item.id);
    if (user.role === "STUDENT" && item.current_class_id != null) {
      user.className = user.className || String(item.current_class_id);
    }
  } catch {
    /* veli/ogrenci profili opsiyonel */
  }

  return user;
}

export async function login({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  let user = mapLoginUser(data, email);

  await writeStoredSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user
  });

  user = await attachStudentContext(user);

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
