import { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

// ponytail: in-memory counter, so the limit is per-process. Fine for a single
// instance; move to Redis (or express-rate-limit with a store) if this is ever
// run behind more than one node.
export const rateLimit = ({ windowMs, max }: { windowMs: number; max: number }) => {
  const buckets = new Map<string, Bucket>();

  // Drop expired buckets so the map can't grow without bound.
  // Unref'd so it never holds the process open.
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.user?.id || req.ip || "anonymous";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({ message: "Too many requests, try again shortly" });
      return;
    }

    bucket.count += 1;
    next();
  };
};
