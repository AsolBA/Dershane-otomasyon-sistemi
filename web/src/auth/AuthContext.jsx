import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./storage";
import { authService } from "../services";

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

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearStoredSession();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    const session = await authService.login({ email, password, role });
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    setUser(session.user);
    return session;
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    const session = readStoredSession();
    writeStoredSession({ ...session, user: nextUser });
  }, []);

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      const result = await authService.changePassword({ currentPassword, newPassword });
      if (result.user) {
        updateUser(result.user);
      }
      return result;
    },
    [updateUser]
  );

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      changePassword
    }),
    [accessToken, refreshToken, user, isAuthenticated, login, logout, updateUser, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
