import { getToken } from "./auth";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

// Handles both Mongo (_id) and legacy (id) shapes.
export const getId = (obj: any): string => obj?._id || obj?.id;

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Single place that attaches the session token, checks the status, and turns
// an error response into a thrown ApiError — so callers can never accidentally
// render an error object as if it were data.
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || `Request failed (${res.status})`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// For list endpoints: guarantees an array so `.map` in a component can never
// blow up on an error payload.
export async function apiList<T>(path: string, init?: RequestInit): Promise<T[]> {
  const data = await api<T[]>(path, init);
  return Array.isArray(data) ? data : [];
}
