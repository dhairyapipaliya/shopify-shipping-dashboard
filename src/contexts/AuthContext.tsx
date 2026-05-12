import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type AuthUser, getMe, logout as apiLogout } from "../api/auth.js";
import { ApiError } from "../api/client.js";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const { user } = await getMe();
      setState({ status: "authenticated", user });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setState({ status: "unauthenticated" });
      } else {
        setState({ status: "unauthenticated" });
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => null);
    setState({ status: "unauthenticated" });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ ...state, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
