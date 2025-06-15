import jwt from "jsonwebtoken";
import ENV from "../config/env.config.js";

export const verifyAuthToken = (req, res, next) => {
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

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", success: false });
    }

    // if (req.user.status !== "active") {
    //   return res
    //     .status(401)
    //     .json({ message: "User is not active", success: false });
    // }

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired token", success: false });
  }
};
