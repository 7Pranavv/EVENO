import { getSessionToken } from "@descope/nextjs-sdk/client";

export type Role = "organizer" | "participant" | "vendor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  vendorId?: string;
  college?: string;
}

const USER_KEY = "eveno_user";

// Only the profile is cached locally. The session token is NOT stored — it
// lives in Descope's own storage and is read live on every call, so a stale
// copy can never be replayed and there's one less secret sitting in
// localStorage for an XSS to walk off with.
export const saveUser = (user: AuthUser): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Descope's module-level SDK is a placeholder built with persistTokens:false
  // until <AuthProvider> mounts and replaces it, and the placeholder has no
  // getSessionToken method at all. Reading the token during that window throws
  // "getSessionToken is not a function", which unhandled will blank the page.
  //
  // Callers already cope with a missing token — the request simply goes out
  // unauthenticated and comes back 401 — so a failed read degrades to a
  // retryable error instead of a crash.
  try {
    return getSessionToken() || null;
  } catch {
    return null;
  }
};

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
  // Clear the legacy token copy left behind by older versions of this app.
  localStorage.removeItem("emple_token");
  localStorage.removeItem("emple_user");
  document.cookie = "emple_token=; path=/; max-age=0";
};
