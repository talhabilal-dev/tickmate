import jwt from "jsonwebtoken";
import ENV from "../config/env.config.js";

export const verifyAuthToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing", success: false });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired token", success: false });
  }
};
