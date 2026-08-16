import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
import type { NextFunction, Request, Response } from "express";

export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.token;

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing", success: false });
    }

    if (!ENV.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      userId: string;
      role: string;
      isActive: boolean;
    };

    req.user = decoded;

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", success: false });
    }

    if (!req.user.isActive) {
      return res
        .status(401)
        .json({ message: "Admin is not active", success: false });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admins only", success: false });
    }

    next();
  } catch (err) {
    console.error("Admin JWT verification failed:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired token", success: false });
  }
};
