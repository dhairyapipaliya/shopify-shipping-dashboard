import { apiFetch } from "./client.js";

export type AuthUser = { id: string; email: string };

export const getMe = () => apiFetch<{ user: AuthUser }>("/api/auth/me");

export const login = (email: string, password: string) =>
  apiFetch<{ user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const logout = () =>
  apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
