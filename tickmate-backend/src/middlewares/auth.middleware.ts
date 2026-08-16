import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
import db from "../config/db.config.js";
import { usersTable } from "../models/model.js";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

export const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.token;
    // Check for Bearer token in Authorization header if not in cookies
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

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const payload = decoded as {
      userId: string | number;
    };

    const userId = Number(payload.userId);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", success: false });
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", success: false });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "User is not active", success: false });
    }

    req.user = {
      userId: String(user.id),
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired token", success: false });
  }
};