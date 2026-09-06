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
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    // fetch rejects with a bare "Failed to fetch" for DNS failures, refused
    // connections, CORS rejections and offline clients alike — it never says
    // which URL it tried. Naming it turns the most common misconfiguration
    // (a deployed site still pointing at localhost) into a self-explaining
    // error instead of a guessing game.
    const hint =
      typeof window !== "undefined" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)/.test(API_BASE) &&
      !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
        ? ` This page is served from ${window.location.origin} but the API address points at your own machine — NEXT_PUBLIC_API_BASE needs to be the deployed API URL, and it is applied at build time.`
        : "";

    throw new ApiError(`Could not reach the API at ${API_BASE}.${hint}`, 0);
  }

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
