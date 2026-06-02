import { API_BASE_URL } from "./config.js";
import { readStoredSession, writeStoredSession, clearStoredSession } from "../auth/storage.js";

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
  const session = readStoredSession();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (session.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const body = await parseJson(res);

  if (res.status === 401 && session.refreshToken && !options._retry) {
    const refreshed = await tryRefresh(session.refreshToken);
    if (refreshed) {
      return apiRequest(path, { ...options, _retry: true });
    }
    clearStoredSession();
  }

  if (!res.ok) {
    const message = body?.message || body?.error?.details || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  if (body && body.success === false) {
    const err = new Error(body.message || "API error");
    err.body = body;
    throw err;
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

    const session = readStoredSession();
    writeStoredSession({
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken || refreshToken,
      user: session.user
    });
    return true;
  } catch {
    return false;
  }
}
