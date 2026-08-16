import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const cleanup = (windowMs: number) => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
  void windowMs;
};

const getClientKey = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : (forwarded?.split(",")[0]?.trim() ?? req.socket?.remoteAddress ?? "unknown");
  const authScope = req.user?.userId ?? "anonymous";
  return `${ip}:${authScope}`;
};

const runCleanupInterval = (() => {
  let started = false;
  return () => {
    if (started) return;
    started = true;
    const interval = setInterval(() => {
      for (const entry of store.values()) {
        const now = Date.now();
        if (entry.resetAt <= now) {
          for (const [key, candidate] of store) {
            if (candidate === entry) store.delete(key);
          }
        }
      }
    }, 60_000);
    interval.unref?.();
  };
})();

export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = "Too many requests, please try again later.",
    statusCode = 429,
  } = options;

  cleanup(windowMs);
  runCleanupInterval();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = getClientKey(req);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader(
      "X-RateLimit-Remaining",
      String(Math.max(0, max - entry.count))
    );
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil(entry.resetAt / 1000))
    );

    if (entry.count > max) {
      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    next();
  };
};