import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./storage";
import { authService } from "../services";

const AuthContext = createContext(null);

export const ROLES = {
  STUDENT: "STUDENT",
  PARENT: "PARENT"
};

export function AuthProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const session = await readStoredSession();
      setAccessToken(session.accessToken);
      setUser(session.user);
      setBooting(false);
    })();
  }, []);

  const isAuthenticated = Boolean(accessToken && user?.role);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      await clearStoredSession();
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    const session = await authService.login({ email, password, role });
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session;
  }, []);

  const updateUser = useCallback(async (nextUser) => {
    setUser(nextUser);
    const session = await readStoredSession();
    await writeStoredSession({ ...session, user: nextUser });
  }, []);

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      const result = await authService.changePassword({ currentPassword, newPassword });
      if (result.user) {
        await updateUser(result.user);
      }
      return result;
    },
    [updateUser]
  );

  const value = useMemo(
    () => ({
      booting,
      accessToken,
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      changePassword
    }),
    [booting, accessToken, user, isAuthenticated, login, logout, updateUser, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
