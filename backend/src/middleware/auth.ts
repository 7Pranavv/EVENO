import { Request, Response, NextFunction } from "express";
import DescopeClient from "@descope/node-sdk";
import { env } from "../config/env";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string; role?: string };
    }
  }
}

const descopeClient = DescopeClient({ projectId: env.descopeProjectId });

// Requires a valid Descope session token in the Authorization header.
// Also loads the local profile so `role` is authoritative (never client-supplied)
// and banned users lose access immediately rather than at token expiry.
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Missing auth token" });
    return;
  }

  let descopeId: string;
  let email: string | undefined;

  try {
    const authInfo = await descopeClient.validateSession(token);
    descopeId = authInfo.token.sub as string;
    email = (authInfo.token as any).email;
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  // No profile row yet is fine — /api/users/sync creates it on first login.
  const profile = await User.findOne({ descopeId });

  if (profile?.status === "banned") {
    res.status(403).json({ message: "Account suspended" });
    return;
  }

  req.user = { id: descopeId, email, role: profile?.role };
  next();
};

// Attaches req.user when a valid token is present, but lets anonymous
// requests through — for endpoints that are public yet behave differently
// for a logged-in caller (e.g. GET /api/events?mine=true).
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;

  if (!token) {
    next();
    return;
  }

  // A stale or invalid token must not turn a public endpoint into a 401 —
  // the caller just gets treated as anonymous. Routes that actually need a
  // user still check req.user themselves.
  try {
    const authInfo = await descopeClient.validateSession(token);
    const descopeId = authInfo.token.sub as string;
    const profile = await User.findOne({ descopeId });
    if (profile?.status !== "banned") {
      req.user = { id: descopeId, email: (authInfo.token as any).email, role: profile?.role };
    }
  } catch {
    // fall through as anonymous
  }

  next();
};

// Route guard for a specific role. Must run after requireAuth.
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
};
