import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./storage";

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: "ADMIN",
  DIRECTOR: "DIRECTOR",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT"
};

export function AuthProvider({ children }) {
  const initial = readStoredSession();
  const [accessToken, setAccessToken] = useState(initial.accessToken);
  const [refreshToken, setRefreshToken] = useState(initial.refreshToken);
  const [user, setUser] = useState(initial.user);

  const isAuthenticated = Boolean(accessToken && user?.role);

  const logout = useCallback(() => {
    clearStoredSession();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    // Mock auth for UI development. Replace with real API call later.
    const safeEmail = email?.trim() || "demo@dershane.local";
    const safeRole = role || ROLES.TEACHER;

    const mockAccess = `mock_access_${safeRole.toLowerCase()}`;
    const mockRefresh = `mock_refresh_${safeRole.toLowerCase()}`;

    const nextUser = {
      id: "mock-user-id",
      email: safeEmail,
      name: "Demo Kullanici",
      role: safeRole,
      // password intentionally not stored
      passwordUsed: Boolean(password)
    };

    writeStoredSession({
      accessToken: mockAccess,
      refreshToken: mockRefresh,
      user: nextUser
    });

    setAccessToken(mockAccess);
    setRefreshToken(mockRefresh);
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated,
      login,
      logout
    }),
    [accessToken, refreshToken, user, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
