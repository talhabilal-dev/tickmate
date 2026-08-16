import { verifyAuthToken } from "./auth.middleware.js";
import type { NextFunction, Request, Response } from "express";

export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  verifyAuthToken(req, res, async () => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Forbidden: Admins only", success: false });
      }
      next();
    } catch (err) {
      console.error("Admin token verification failed:", err);
      return res
        .status(403)
        .json({ message: "Forbidden: Admins only", success: false });
    }
  });
};