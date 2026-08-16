import express, { Router } from "express";
import {
  signup,
  verify,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkUsernameAvailability,
  resendVerificationEmail,
  getUser,
  updateUser,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rate-limit.middleware.js";

const router: Router = express.Router();

const authLimit = rateLimit({ windowMs: 60_000, max: 10 });
const passwordLimit = rateLimit({ windowMs: 60_000, max: 5 });

router.post("/register", authLimit, signup);
router.post("/verify", authLimit, verify);
router.post("/login", authLimit, login);
router.post("/logout", verifyAuthToken, logout);
router.post("/forgot-password", passwordLimit, forgotPassword);
router.post("/reset-password", passwordLimit, resetPassword);
router.get("/check-username/:username", rateLimit({ windowMs: 60_000, max: 60 }), checkUsernameAvailability);
router.post("/resend-verification-email", passwordLimit, resendVerificationEmail);
router.patch("/profile", verifyAuthToken, updateUser);
router.put("/update-password", verifyAuthToken, passwordLimit, changePassword);
router.get("/profile", verifyAuthToken, getUser);
router.delete("/profile", verifyAuthToken, deleteAccount);

export default router;