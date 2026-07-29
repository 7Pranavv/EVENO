import { getSessionToken } from "@descope/nextjs-sdk/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  vendorId?: string;
  college?: string;
}

// Save token + user (login ke baad call karo)
export const saveAuth = (token: string, user: AuthUser): void => {
  localStorage.setItem("emple_token", token);
  localStorage.setItem("emple_user", JSON.stringify(user));
  document.cookie = `emple_token=${token}; path=/`;
};

// Token get karo — Descope keeps refreshing the session token in the
// background on its own timer, so always read the live token instead of
// the static copy saved once at login (that copy goes stale after the
// session token's short lifetime and every authenticated call starts
// failing with 401 even though the user is still logged in).
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const liveToken = getSessionToken();
  if (liveToken) return liveToken;
  return localStorage.getItem("emple_token");
};

// User get karo
export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("emple_user");
  return user ? JSON.parse(user) : null;
};

// Logged in hai ya nahi
export const isLoggedIn = (): boolean => {
  return !!getToken();
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("emple_token");
  localStorage.removeItem("emple_user");
  document.cookie = "emple_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};