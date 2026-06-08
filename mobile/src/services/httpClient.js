import { API_BASE_URL } from "./config";
import { readStoredSession, writeStoredSession, clearStoredSession } from "../auth/storage";

async function parseJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text };
  }
}

export async function apiRequest(path, options = {}) {
  const session = await readStoredSession();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (session.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await parseJson(res);

  if (res.status === 401 && session.refreshToken && !options._retry) {
    const refreshed = await tryRefresh(session.refreshToken);
    if (refreshed) {
      return apiRequest(path, { ...options, _retry: true });
    }
    await clearStoredSession();
  }

  if (!res.ok) {
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  if (body && body.success === false) {
    throw new Error(body.message || "API error");
  }
  return body?.data ?? body;
}

async function tryRefresh(refreshToken) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    const body = await parseJson(res);
    if (!res.ok || !body?.data?.accessToken) return false;

    const session = await readStoredSession();
    await writeStoredSession({
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken || refreshToken,
      user: session.user
    });
    return true;
  } catch {
    return false;
  }
}
