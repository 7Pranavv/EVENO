import { Request, Response, NextFunction } from "express";
import DescopeClient from "@descope/node-sdk";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email?: string; role?: string };
    }
  }
}

const descopeClient = DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID as string });

// Requires a valid Descope session token in the Authorization header.
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Missing auth token" });
    return;
  }

  try {
    const authInfo = await descopeClient.validateSession(token);
    req.user = {
      id: authInfo.token.sub as string,
      email: (authInfo.token as any).email,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
